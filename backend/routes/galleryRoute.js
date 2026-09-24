import express from "express";
import { addGalleryImage, listGalleryImages, removeGalleryImage } from "../controllers/galleryController.js";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/multer.js";

const galleryRouter = express.Router();

// Admin routes
galleryRouter.post("/add", adminAuth, upload.fields([{ name: "image", maxCount: 1 }]), addGalleryImage);
galleryRouter.post("/remove", adminAuth, removeGalleryImage);

// Public routes
galleryRouter.get("/list", listGalleryImages);

export default galleryRouter;
