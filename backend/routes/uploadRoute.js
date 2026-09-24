import express from "express";
import { v2 as cloudinary } from "cloudinary";
import upload from "../middleware/multer.js";
import path from "path";

const uploadRouter = express.Router();

uploadRouter.post("/custom", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: "No image provided" });
        }
        
        const fullPath = path.resolve(req.file.path);
        const result = await cloudinary.uploader.upload(fullPath, {
            resource_type: "image"
        });

        res.json({ success: true, imageUrl: result.secure_url });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

export default uploadRouter;
