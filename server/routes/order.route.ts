import express from "express"
import {isAuthenticated} from "../middlewares/isAuthenticated";
import { isEmailVerified } from "../middlewares/isEmailVerified";
import { createCheckoutSession, getOrders, stripeWebhook } from "../controller/order.controller";
const router = express.Router();

router.route("/").get(isAuthenticated, isEmailVerified, getOrders);
router.route("/checkout/create-checkout-session").post(isAuthenticated, isEmailVerified, createCheckoutSession);
router.route("/webhook").post(stripeWebhook);

export default router;