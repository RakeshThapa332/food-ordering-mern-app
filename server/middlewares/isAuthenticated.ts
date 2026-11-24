import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
    namespace Express{
        interface Request {
            id: string;
        }
    }
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey || secretKey.startsWith("replace_with_")) {
        return res.status(503).json({
            success: false,
            message: "Authentication is not configured on the server."
        });
    }

    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }
        // verify the toekn
        const decode = jwt.verify(token, secretKey) as jwt.JwtPayload;
        if (typeof decode.userId !== "string") {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            })
        }
        req.id = decode.userId;
        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired session."
        })
    }
}