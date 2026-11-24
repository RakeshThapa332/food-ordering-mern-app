import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model";

export const isEmailVerified = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.id).select("isVerified");
        if (!user) {
            return res.status(401).json({ success: false, message: "User session is no longer valid." });
        }
        if (!user.isVerified) {
            return res.status(403).json({ success: false, message: "Verify your email before using this feature." });
        }
        return next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Could not verify account status." });
    }
};
