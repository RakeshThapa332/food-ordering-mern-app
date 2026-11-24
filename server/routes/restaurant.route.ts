import express from "express"
import { createRestaurant, getAllRestaurants, getRestaurant, getRestaurantOrder, getSingleRestaurant, searchRestaurant, updateOrderStatus, updateRestaurant } from "../controller/restaurant.controller";
import upload from "../middlewares/multer";
import {isAuthenticated} from "../middlewares/isAuthenticated";
import { isEmailVerified } from "../middlewares/isEmailVerified";

const router = express.Router();

router.route("/").post(isAuthenticated, isEmailVerified, upload.single("imageFile"), createRestaurant);
router.route("/").get(isAuthenticated, isEmailVerified, getRestaurant);
router.route("/").put(isAuthenticated, isEmailVerified, upload.single("imageFile"), updateRestaurant);
router.route("/all").get(getAllRestaurants);
router.route("/order").get(isAuthenticated, isEmailVerified, getRestaurantOrder);
router.route("/order/:orderId/status").put(isAuthenticated, isEmailVerified, updateOrderStatus);
router.route("/search").get(searchRestaurant);
router.route("/search/:searchText").get(searchRestaurant);
router.route("/:id").get(getSingleRestaurant);

export default router;



