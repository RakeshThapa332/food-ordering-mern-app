import { Request, Response } from "express";
import { User } from "../models/user.model";
import bcrypt from "bcryptjs";
import crypto from "crypto"; 
import cloudinary from "../utils/cloudinary";
import { generateVerificationCode } from "../utils/generateVerificationCode";
import { generateToken } from "../utils/generateToken";
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/email";

export const signup = async (req: Request, res: Response) => {
    try {
        const { fullname, email, password, contact } = req.body;
        if (
            typeof fullname !== "string" || !fullname.trim() ||
            typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
            typeof password !== "string" || password.length < 6 ||
            typeof contact !== "string" || !/^\d{10}$/.test(contact)
        ) {
            return res.status(400).json({ success: false, message: "Enter a name, valid email, password of at least 6 characters, and a 10-digit contact number." });
        }

        const normalizedEmail = email.trim().toLowerCase();
        let user = await User.findOne({ email: normalizedEmail });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "User already exist with this email"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken =  generateVerificationCode();

        user = await User.create({
            fullname,
            email: normalizedEmail,
            password: hashedPassword,
            contact: Number(contact),
            admin: normalizedEmail === process.env.SEED_OWNER_EMAIL?.trim().toLowerCase(),
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
        })
        generateToken(res,user);

        try {
            await sendVerificationEmail(normalizedEmail, verificationToken);
        } catch (emailError) {
            console.error("Verification email could not be sent:", emailError);
        }

        const userWithoutPassword = await User.findOne({ email: normalizedEmail }).select("-password");
        return res.status(201).json({
            success: true,
            message: process.env.MAILTRAP_API_TOKEN && !process.env.MAILTRAP_API_TOKEN.startsWith("replace_with_")
                ? "Account created successfully"
                : "Account created. Email verification is unavailable until Mailtrap is configured.",
            user: userWithoutPassword
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
};
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ success: false, message: "Email and password are required." });
        }
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Incorrect email or password"
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect email or password"
            });
        }
        generateToken(res, user);
        user.lastLogin = new Date();
        await user.save();

        // send user without passowrd
        const userWithoutPassword = await User.findOne({ email: email.trim().toLowerCase() }).select("-password");
        return res.status(200).json({
            success: true,
            message: `Welcome back ${user.fullname}`,
            user: userWithoutPassword
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}
export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { verificationCode } = req.body;
        if (typeof verificationCode !== "string" || verificationCode.length !== 6) {
            return res.status(400).json({ success: false, message: "Enter the 6-character verification code." });
        }

        const user = await User.findOne({ verificationToken: verificationCode, verificationTokenExpiresAt: { $gt: Date.now() } }).select("-password");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification token"
            });
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined
        await user.save();

        try {
            await sendWelcomeEmail(user.email, user.fullname);
        } catch (emailError) {
            console.error("Welcome email could not be sent:", emailError);
        }

        return res.status(200).json({
            success: true,
            message: "Email verified successfully.",
            user,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}
export const logout = async (_: Request, res: Response) => {
    try {
        return res.clearCookie("token").status(200).json({
            success: true,
            message: "Logged out successfully."
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
};
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return res.status(400).json({ success: false, message: "Enter a valid email address." });
        }
        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User doesn't exist"
            });
        }

        const resetToken = crypto.randomBytes(40).toString('hex');
        const resetTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordTokenExpiresAt = resetTokenExpiresAt;
        await user.save();

        // send email
        await sendPasswordResetEmail(user.email, `${process.env.FRONTEND_URL}/reset-password/${resetToken}`);

        return res.status(200).json({
            success: true,
            message: "Password reset link sent to your email"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;
        if (typeof newPassword !== "string" || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
        }
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordTokenExpiresAt: { $gt: Date.now() } });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }
        //update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiresAt = undefined;
        await user.save();

        // send success reset email
        await sendResetSuccessEmail(user.email);

        return res.status(200).json({
            success: true,
            message: "Password reset successfully."
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
export const checkAuth = async (req: Request, res: Response) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        };
        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.id;
        const { fullname, address, city, country, profilePicture } = req.body;
        const updatedData: {
            fullname?: string;
            address?: string;
            city?: string;
            country?: string;
            profilePicture?: string;
        } = {};
        if (typeof fullname === "string") updatedData.fullname = fullname;
        if (typeof address === "string") updatedData.address = address;
        if (typeof city === "string") updatedData.city = city;
        if (typeof country === "string") updatedData.country = country;

        if (typeof profilePicture === "string") {
            if (profilePicture.startsWith("data:image/")) {
                const uploadResponse = await cloudinary.uploader.upload(profilePicture);
                updatedData.profilePicture = uploadResponse.secure_url;
            } else if (profilePicture === "" || /^https?:\/\//i.test(profilePicture)) {
                updatedData.profilePicture = profilePicture;
            } else {
                return res.status(400).json({ success: false, message: "Profile picture must be an image or a valid image URL." });
            }
        }

        const user = await User.findByIdAndUpdate(userId, updatedData, { new: true, runValidators: true }).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        return res.status(200).json({
            success:true,
            user,
            message:"Profile updated successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
