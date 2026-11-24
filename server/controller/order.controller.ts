import { Request, Response } from "express";
import { Restaurant } from "../models/restaurant.model";
import { Order } from "../models/order.model";
import Stripe from "stripe";
import mongoose from "mongoose";
import { Menu } from "../models/menu.model";

type CheckoutSessionRequest = {
    cartItems: {
        menuId: string;
        name: string;
        image: string;
        price: number;
        quantity: number
    }[],
    deliveryDetails: {
        name: string;
        email: string;
        contact: string;
        address: string;
        city: string;
        country: string;
    },
    restaurantId: string
}

export const getOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find({ user: req.id }).populate('restaurant').sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const createCheckoutSession = async (req: Request, res: Response) => {
    try {
        const requestBody = req.body as Partial<CheckoutSessionRequest> | undefined;
        if (
            !requestBody ||
            typeof requestBody.restaurantId !== "string" ||
            !mongoose.Types.ObjectId.isValid(requestBody.restaurantId) ||
            !Array.isArray(requestBody.cartItems) ||
            requestBody.cartItems.length === 0
        ) {
            return res.status(400).json({ success: false, message: "A restaurant and at least one menu item are required." });
        }
        const checkoutSessionRequest = requestBody as CheckoutSessionRequest;
        if (!checkoutSessionRequest.cartItems.every((item) => item && typeof item.menuId === "string" && mongoose.Types.ObjectId.isValid(item.menuId) && Number.isInteger(item.quantity) && item.quantity > 0)) {
            return res.status(400).json({ success: false, message: "Menu item quantities must be positive whole numbers." });
        }
        const { name, email, contact, address, city, country } = checkoutSessionRequest.deliveryDetails || {};
        if (
            ![name, email, contact, address, city, country].every((value) => typeof value === "string" && value.trim()) ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            return res.status(400).json({ success: false, message: "Complete delivery contact and address details are required." });
        }
        const secretKey = process.env.STRIPE_SECRET_KEY;
        if (!secretKey || secretKey.startsWith("replace_with_")) {
            return res.status(503).json({ success: false, message: "Online checkout is not configured. Set STRIPE_SECRET_KEY on the server." });
        }
        const stripe = new Stripe(secretKey);
        const restaurant = await Restaurant.findById(checkoutSessionRequest.restaurantId);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found."
            })
        };
        const menuItems = await Menu.find({ _id: { $in: restaurant.menus } });
        const orderItems = [];
        for (const cartItem of checkoutSessionRequest.cartItems) {
            const menuItem = menuItems.find((item) => String(item._id) === cartItem.menuId);
            if (!menuItem) {
                return res.status(400).json({ success: false, message: "One or more selected menu items are not available at this restaurant." });
            }
            orderItems.push({
                menuId: String(menuItem._id),
                name: menuItem.name,
                image: menuItem.image,
                price: menuItem.price,
                quantity: cartItem.quantity,
            });
        }
        const lineItems = createLineItems(orderItems);
        const order = new Order({
            restaurant: restaurant._id,
            user: req.id,
            deliveryDetails: checkoutSessionRequest.deliveryDetails,
            cartItems: orderItems,
            status: "pending"
        });
        const orderId = order.id;
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            shipping_address_collection: {
                allowed_countries: ['NP']
            },
            line_items: lineItems,
            mode: 'payment',
            success_url: `${frontendUrl}/order/status?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/cart`,
            metadata: {
                orderId,
                images: JSON.stringify(orderItems.map((item) => item.image))
            }
        });
        if (!session.url) {
            return res.status(400).json({ success: false, message: "Error while creating session" });
        }
        await order.save();
        return res.status(200).json({
            session
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Internal server error" })

    }
}

export const stripeWebhook = async (req: Request, res: Response) => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.WEBHOOK_ENDPOINT_SECRET;
    const signature = req.headers["stripe-signature"];
    if (!secretKey || secretKey.startsWith("replace_with_") || !webhookSecret || webhookSecret.startsWith("replace_with_")) {
        return res.status(503).json({ success: false, message: "Stripe webhook is not configured on the server." });
    }
    if (typeof signature !== "string" || !Buffer.isBuffer(req.body)) {
        return res.status(400).json({ success: false, message: "Stripe webhook signature or raw request body is missing." });
    }

    const stripe = new Stripe(secretKey);
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Invalid webhook signature.";
        console.error("Webhook error:", message);
        return res.status(400).send(`Webhook error: ${message}`);
    }

    // Handle the checkout session completed event
    if (event.type === "checkout.session.completed") {
        try {
            const session = event.data.object as Stripe.Checkout.Session;
            const order = await Order.findById(session.metadata?.orderId);

            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }

            // Update the order with the amount and status
            if (session.amount_total !== null) {
                order.totalAmount = session.amount_total;
            }
            order.status = "confirmed";

            await order.save();
        } catch (error) {
            console.error('Error handling event:', error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    // Send a 200 response to acknowledge receipt of the event
    res.status(200).send();
};

const createLineItems = (cartItems: { name: string; image: string; price: number; quantity: number }[]) => {
    return cartItems.map((item) => ({
            price_data: {
                currency: 'npr',
                product_data: {
                    name: item.name,
                    images: [item.image],
                },
                unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity,
        }));
}