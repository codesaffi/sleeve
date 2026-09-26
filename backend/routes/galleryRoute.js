import express from "express";
import { addGalleryImage, listGalleryCategories, listGalleryImages, removeGalleryImage } from "../controllers/galleryController.js";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/multer.js";

const galleryRouter = express.Router();

const handleGalleryUpload = (req, res, next) => {
    upload.fields([{ name: "images", maxCount: 10 }, { name: "image", maxCount: 1 }])(req, res, (error) => {
        if (!error) return next();

        const message = error.code === "LIMIT_UNEXPECTED_FILE"
            ? "You can upload a maximum of 10 images at a time."
            : error.message;
        return res.status(400).json({ success: false, message });
    });
};

// Admin routes
galleryRouter.post("/add", adminAuth, handleGalleryUpload, addGalleryImage);
galleryRouter.post("/remove", adminAuth, removeGalleryImage);

// Public routes
galleryRouter.get("/categories", listGalleryCategories);
galleryRouter.get("/list", listGalleryImages);

export default galleryRouter;
