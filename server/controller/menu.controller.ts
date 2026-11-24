import { Request, Response } from "express";
import mongoose from "mongoose";
import { Menu } from "../models/menu.model";
import { Restaurant } from "../models/restaurant.model";
import uploadImageOnCloudinary from "../utils/imageUpload";

const isValidMenuData = (name: unknown, description: unknown, price: unknown) =>
    typeof name === "string" && name.trim().length > 0 &&
    typeof description === "string" && description.trim().length > 0 &&
    Number.isFinite(Number(price)) && Number(price) > 0;

export const addMenu = async (req: Request, res: Response) => {
    try {
        const { name, description, price } = req.body;
        const file = req.file;
        if (!isValidMenuData(name, description, price)) {
            return res.status(400).json({ success: false, message: "Provide a name, description, and a price greater than zero." });
        }
        if (!file) {
            return res.status(400).json({ success: false, message: "Image is required." });
        }

        const restaurant = await Restaurant.findOne({ user: req.id });
        if (!restaurant) {
            return res.status(404).json({ success: false, message: "Create a restaurant before adding menu items." });
        }

        const imageUrl = await uploadImageOnCloudinary(file);
        const menu = await Menu.create({
            name: name.trim(),
            description: description.trim(),
            price: Number(price),
            image: imageUrl,
        });
        restaurant.menus.push(new mongoose.Types.ObjectId(menu.id));
        await restaurant.save();

        return res.status(201).json({ success: true, message: "Menu added successfully.", menu });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Could not add menu item." });
    }
};

export const editMenu = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, price } = req.body;
        const file = req.file;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid menu item." });
        }

        const restaurant = await Restaurant.findOne({ user: req.id, menus: id });
        if (!restaurant) {
            return res.status(404).json({ success: false, message: "Menu item not found for your restaurant." });
        }

        const menu = await Menu.findById(id);
        if (!menu) {
            return res.status(404).json({ success: false, message: "Menu item not found." });
        }

        if (name !== undefined) {
            if (typeof name !== "string" || !name.trim()) {
                return res.status(400).json({ success: false, message: "Menu name cannot be empty." });
            }
            menu.name = name.trim();
        }
        if (description !== undefined) {
            if (typeof description !== "string" || !description.trim()) {
                return res.status(400).json({ success: false, message: "Menu description cannot be empty." });
            }
            menu.description = description.trim();
        }
        if (price !== undefined && price !== "") {
            if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
                return res.status(400).json({ success: false, message: "Menu price must be greater than zero." });
            }
            menu.price = Number(price);
        }
        if (file) {
            menu.image = await uploadImageOnCloudinary(file);
        }

        await menu.save();
        return res.status(200).json({ success: true, message: "Menu updated.", menu });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Could not update menu item." });
    }
};

export const deleteMenu = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid menu item." });
        }

        const restaurant = await Restaurant.findOne({ user: req.id, menus: id });
        if (!restaurant) {
            return res.status(404).json({ success: false, message: "Menu item not found for your restaurant." });
        }

        await Menu.findByIdAndDelete(id);
        restaurant.menus = restaurant.menus.filter((menuId) => menuId.toString() !== id);
        await restaurant.save();

        return res.status(200).json({ success: true, message: "Menu item deleted." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Could not delete menu item." });
    }
};
