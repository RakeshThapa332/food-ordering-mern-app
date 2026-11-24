import express from "express" 
import upload from "../middlewares/multer";
import {isAuthenticated} from "../middlewares/isAuthenticated";
import { isEmailVerified } from "../middlewares/isEmailVerified";
import { addMenu, deleteMenu, editMenu } from "../controller/menu.controller";

const router = express.Router();

router.route("/").post(isAuthenticated, isEmailVerified, upload.single("image"), addMenu);
router.route("/:id").put(isAuthenticated, isEmailVerified, upload.single("image"), editMenu);
router.route("/:id").delete(isAuthenticated, isEmailVerified, deleteMenu);
 
export default router;



