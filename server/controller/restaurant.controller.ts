import { Request, Response } from "express";
import { Restaurant } from "../models/restaurant.model";
import uploadImageOnCloudinary from "../utils/imageUpload";
import { Order } from "../models/order.model";
import mongoose from "mongoose";
import { Menu } from "../models/menu.model";

type RestaurantResult = {
    user: unknown;
    restaurantName: string;
    city?: string;
    country?: string;
    imageUrl?: string;
    deliveryTime?: number;
    cuisines?: unknown[];
    menus?: unknown[];
};

const restaurantCompleteness = (restaurant: RestaurantResult) =>
    Number(Boolean(restaurant.city?.trim())) +
    Number(Boolean(restaurant.country?.trim())) +
    Number(Boolean(restaurant.imageUrl?.trim())) +
    Number(typeof restaurant.deliveryTime === "number" && restaurant.deliveryTime > 0) +
    Number(Boolean(restaurant.cuisines?.length)) +
    (restaurant.menus?.length || 0);

const deduplicateRestaurants = <T extends RestaurantResult>(restaurants: T[]) => {
    const uniqueRestaurants = new Map<string, T>();

    for (const restaurant of restaurants) {
        const key = `${String(restaurant.user)}:${restaurant.restaurantName.trim().toLocaleLowerCase()}`;
        const existing = uniqueRestaurants.get(key);
        if (!existing || restaurantCompleteness(restaurant) > restaurantCompleteness(existing)) {
            uniqueRestaurants.set(key, restaurant);
        }
    }

    return Array.from(uniqueRestaurants.values());
};

const parseRestaurantInput = (body: Request["body"]) => {
    const { restaurantName, city, country, deliveryTime, cuisines } = body;
    let parsedCuisines: unknown;
    try {
        parsedCuisines = typeof cuisines === "string" ? JSON.parse(cuisines) : cuisines;
    } catch {
        return null;
    }

    const parsedDeliveryTime = Number(deliveryTime);
    if (
        typeof restaurantName !== "string" || !restaurantName.trim() ||
        typeof city !== "string" || !city.trim() ||
        typeof country !== "string" || !country.trim() ||
        !Number.isInteger(parsedDeliveryTime) || parsedDeliveryTime <= 0 ||
        !Array.isArray(parsedCuisines) ||
        parsedCuisines.length === 0 ||
        !parsedCuisines.every((cuisine) => typeof cuisine === "string" && cuisine.trim())
    ) {
        return null;
    }

    return {
        restaurantName: restaurantName.trim(),
        city: city.trim(),
        country: country.trim(),
        deliveryTime: parsedDeliveryTime,
        cuisines: parsedCuisines.map((cuisine: string) => cuisine.trim()),
    };
};

export const createRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurantInput = parseRestaurantInput(req.body);
        const file = req.file;

        if (!restaurantInput) {
            return res.status(400).json({ success: false, message: "Provide a name, city, country, positive delivery time, and at least one cuisine." });
        }

        const restaurant = await Restaurant.findOne({ user: req.id });
        if (restaurant) {
            return res.status(400).json({
                success: false,
                message: "Restaurant already exist for this user"
            })
        }
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Image is required"
            })
        }
        const imageUrl = await uploadImageOnCloudinary(file);
        await Restaurant.create({
            user: req.id,
            ...restaurantInput,
            imageUrl
        });
        return res.status(201).json({
            success: true,
            message: "Restaurant Added"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}
export const getRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({ user: req.id }).populate('menus');
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                restaurant:[],
                message: "Restaurant not found"
            })
        };
        return res.status(200).json({ success: true, restaurant });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}
export const getAllRestaurants = async (_req: Request, res: Response) => {
    try {
        const restaurants = deduplicateRestaurants(
            await Restaurant.find().sort({ createdAt: 1 }).populate("menus")
        );
        return res.status(200).json({
            success: true,
            data: restaurants
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
export const updateRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurantInput = parseRestaurantInput(req.body);
        const file = req.file;
        if (!restaurantInput) {
            return res.status(400).json({ success: false, message: "Provide a name, city, country, positive delivery time, and at least one cuisine." });
        }
        const restaurant = await Restaurant.findOne({ user: req.id });
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            })
        };
        restaurant.restaurantName = restaurantInput.restaurantName;
        restaurant.city = restaurantInput.city;
        restaurant.country = restaurantInput.country;
        restaurant.deliveryTime = restaurantInput.deliveryTime;
        restaurant.cuisines = restaurantInput.cuisines;

        if (file) {
            const imageUrl = await uploadImageOnCloudinary(file);
            restaurant.imageUrl = imageUrl;
        }
        await restaurant.save();
        return res.status(200).json({
            success: true,
            message: "Restaurant updated",
            restaurant
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}
export const getRestaurantOrder = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({ user: req.id });
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            })
        };
        const orders = await Order.find({ restaurant: restaurant._id }).populate('restaurant').populate('user').sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const allowedStatuses = ["pending", "confirmed", "preparing", "outfordelivery", "delivered"];
        if (!mongoose.Types.ObjectId.isValid(orderId) || !allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid order or status." });
        }
        const restaurant = await Restaurant.findOne({ user: req.id });
        if (!restaurant) {
            return res.status(404).json({ success: false, message: "Restaurant not found." });
        }
        const order = await Order.findOne({ _id: orderId, restaurant: restaurant._id });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }
        order.status = status;
        await order.save();
        return res.status(200).json({
            success: true,
            status:order.status,
            message: "Status updated"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}
export const searchRestaurant = async (req: Request, res: Response) => {
    try {
        const searchText = req.params.searchText === "all" ? "" : (req.params.searchText || "");
        const searchQuery = typeof req.query.searchQuery === "string" ? req.query.searchQuery : "";
        const selectedCuisines = (typeof req.query.selectedCuisines === "string" ? req.query.selectedCuisines : "")
            .split(",")
            .map((cuisine) => cuisine.trim())
            .filter(Boolean);
        const filters: Record<string, unknown>[] = [];
        const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        if (searchText) {
            const pattern = new RegExp(escapeRegex(searchText.trim()), "i");
            const matchingMenus = await Menu.find({ name: pattern }).select("_id");
            filters.push({
                $or: [
                    { restaurantName: pattern },
                    { city: pattern },
                    { country: pattern },
                    { cuisines: pattern },
                    { menus: { $in: matchingMenus.map((menu) => menu._id) } },
                ],
            });
        }

        if (searchQuery) {
            const pattern = new RegExp(escapeRegex(searchQuery.trim()), "i");
            const matchingMenus = await Menu.find({ name: pattern }).select("_id");
            filters.push({
                $or: [
                    { restaurantName: pattern },
                    { city: pattern },
                    { country: pattern },
                    { cuisines: pattern },
                    { menus: { $in: matchingMenus.map((menu) => menu._id) } },
                ],
            });
        }

        if (selectedCuisines.length > 0) {
            filters.push({ cuisines: { $in: selectedCuisines } });
        }

        const query = filters.length > 0 ? { $and: filters } : {};
        const restaurants = deduplicateRestaurants(
            await Restaurant.find(query).sort({ createdAt: 1 })
        );
        return res.status(200).json({
            success:true,
            data:restaurants
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}
export const getSingleRestaurant = async (req:Request, res:Response) => {
    try {
        const restaurantId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
            return res.status(400).json({ success: false, message: "Invalid restaurant." });
        }
        const restaurant = await Restaurant.findById(restaurantId).populate({
            path:'menus',
            options:{sort:{createdAt:-1}}
        });
        if(!restaurant){
            return res.status(404).json({
                success:false,
                message:"Restaurant not found"
            })
        };
        return res.status(200).json({success:true, restaurant});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}