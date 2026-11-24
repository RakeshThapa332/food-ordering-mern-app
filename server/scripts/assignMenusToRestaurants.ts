import "../loadEnv";
import mongoose from "mongoose";
import { Menu } from "../models/menu.model";
import { Restaurant } from "../models/restaurant.model";

const MENUS_PER_RESTAURANT = 10;

const assignMenusToRestaurants = async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error("MONGO_URI is required to assign menus to restaurants.");
    }

    await mongoose.connect(mongoUri);
    try {
        const [restaurants, menus] = await Promise.all([
            Restaurant.collection.find({}, { projection: { _id: 1, menus: 1 } }).sort({ _id: 1 }).toArray(),
            Menu.collection.find({}, { projection: { _id: 1 } }).sort({ _id: 1 }).toArray(),
        ]);

        if (restaurants.length === 0) {
            throw new Error("No restaurants were found.");
        }
        if (menus.length < MENUS_PER_RESTAURANT) {
            throw new Error(`At least ${MENUS_PER_RESTAURANT} menu items are required.`);
        }

        const allRestaurantsAlreadyHaveMenus = restaurants.every((restaurant) => {
            const menuIds = Array.isArray(restaurant.menus) ? restaurant.menus : [];
            return menuIds.length >= MENUS_PER_RESTAURANT;
        });
        if (allRestaurantsAlreadyHaveMenus) {
            console.log("Every restaurant already has at least 10 menu items; no changes made.");
            return;
        }

        let updatedRestaurants = 0;
        for (let restaurantIndex = 0; restaurantIndex < restaurants.length; restaurantIndex += 1) {
            const restaurant = restaurants[restaurantIndex];
            const existingIds = Array.isArray(restaurant.menus) ? restaurant.menus : [];
            const selectedIds = new Map(existingIds.map((id) => [id.toString(), id]));
            const startIndex = (restaurantIndex * MENUS_PER_RESTAURANT) % menus.length;

            for (let offset = 0; selectedIds.size < MENUS_PER_RESTAURANT && offset < menus.length; offset += 1) {
                const menu = menus[(startIndex + offset) % menus.length];
                selectedIds.set(menu._id.toString(), menu._id);
            }

            if (selectedIds.size < MENUS_PER_RESTAURANT) {
                throw new Error(`Could not assign 10 unique menu items to restaurant ${restaurantIndex + 1}.`);
            }

            if (selectedIds.size !== existingIds.length) {
                await Restaurant.collection.updateOne(
                    { _id: restaurant._id },
                    { $set: { menus: Array.from(selectedIds.values()) } },
                );
                updatedRestaurants += 1;
            }
        }

        console.log(`Assigned at least 10 menu items to ${updatedRestaurants} restaurants.`);
    } finally {
        await mongoose.disconnect();
    }
};

assignMenusToRestaurants().catch((error: unknown) => {
    console.error("Could not assign menu items to restaurants:", error);
    process.exitCode = 1;
});
