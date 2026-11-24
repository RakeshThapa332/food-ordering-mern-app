import jwt from "jsonwebtoken";
import { IUserDocument } from "../models/user.model";
import { Response } from "express";

export const generateToken = (res:Response, user:IUserDocument ) => {
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey || secretKey.startsWith("replace_with_")) {
        throw new Error("SECRET_KEY is not configured.");
    }
    const token = jwt.sign({userId:user._id}, secretKey, {expiresIn:'1d'});
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
    });
    return token;
}