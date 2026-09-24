import { v2 as cloudinary } from "cloudinary";
import galleryModel from "../models/galleryModel.js";
import path from "path";

// Add gallery image
const addGalleryImage = async (req, res) => {
    try {
        const { title, description } = req.body;
        const imageFile = req.files.image && req.files.image[0];

        if (!imageFile) {
            return res.json({ success: false, message: "Image is required" });
        }

        const fullPath = path.resolve(imageFile.path);
        const result = await cloudinary.uploader.upload(fullPath, {
            resource_type: "image"
        });

        const newImage = new galleryModel({
            image: result.secure_url,
            title: title || "",
            description: description || ""
        });

        await newImage.save();
        res.json({ success: true, message: "Gallery image added successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// List gallery images
const listGalleryImages = async (req, res) => {
    try {
        const images = await galleryModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, images });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Remove gallery image
const removeGalleryImage = async (req, res) => {
    try {
        await galleryModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Gallery image removed" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export { addGalleryImage, listGalleryImages, removeGalleryImage };
