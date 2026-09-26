import { v2 as cloudinary } from "cloudinary";
import galleryModel from "../models/galleryModel.js";
import { unlink } from "fs/promises";
import path from "path";

const getCategoryName = (category) => category?.trim() || "Uncategorized";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const cleanupFiles = async (files) => {
    const results = await Promise.allSettled(files.map((file) => unlink(file.path)));
    results
        .filter((result) => result.status === "rejected" && result.reason.code !== "ENOENT")
        .forEach((result) => console.error("Failed to remove temporary gallery upload:", result.reason));
};

const cleanupCloudinaryUploads = async (uploads) => {
    const results = await Promise.allSettled(
        uploads.map((upload) => cloudinary.uploader.destroy(upload.public_id, { resource_type: "image" }))
    );
    results
        .filter((result) => result.status === "rejected")
        .forEach((result) => console.error("Failed to remove incomplete gallery upload:", result.reason));
};

const addGalleryImage = async (req, res) => {
    const files = [...(req.files?.images || []), ...(req.files?.image || [])];
    let uploadedImages = [];

    try {
        const categoryInput = typeof req.body.category === "string" ? req.body.category.trim() : "";

        if (!categoryInput) {
            return res.status(400).json({ success: false, message: "Category name is required" });
        }

        if (files.length === 0) {
            return res.status(400).json({ success: false, message: "Please select at least one image" });
        }

        if (files.length > 10) {
            return res.status(400).json({ success: false, message: "You can upload a maximum of 10 images at a time." });
        }

        if (files.some((file) => !file.mimetype?.startsWith("image/"))) {
            return res.status(400).json({ success: false, message: "All uploaded files must be images" });
        }

        const existingCategory = await galleryModel
            .findOne({ category: { $regex: `^\\s*${escapeRegex(categoryInput)}\\s*$`, $options: "i" } })
            .sort({ createdAt: 1 });
        const category = existingCategory?.category?.trim() || categoryInput;

        const uploadResults = await Promise.allSettled(
            files.map((file) => cloudinary.uploader.upload(path.resolve(file.path), { resource_type: "image" }))
        );
        uploadedImages = uploadResults
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value);

        const failedUpload = uploadResults.find((result) => result.status === "rejected");
        if (failedUpload) {
            await cleanupCloudinaryUploads(uploadedImages);
            uploadedImages = [];
            throw failedUpload.reason;
        }

        await galleryModel.insertMany(uploadedImages.map((upload) => ({
            image: upload.secure_url,
            title: req.body.title || "",
            description: req.body.description || "",
            category,
        })));

        uploadedImages = [];
        return res.json({
            success: true,
            message: `${files.length} ${files.length === 1 ? "image" : "images"} uploaded successfully to ${category}.`,
        });
    } catch (error) {
        if (uploadedImages.length > 0) {
            await cleanupCloudinaryUploads(uploadedImages);
        }
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        await cleanupFiles(files);
    }
};

const listGalleryImages = async (req, res) => {
    try {
        const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
        const filter = category
            ? category.toLowerCase() === "uncategorized"
                ? {
                    $or: [
                        { category: { $regex: "^\\s*Uncategorized\\s*$", $options: "i" } },
                        { category: { $exists: false } },
                        { category: null },
                        { category: /^\s*$/ },
                    ],
                }
                : { category: { $regex: `^\\s*${escapeRegex(category)}\\s*$`, $options: "i" } }
            : {};
        const records = await galleryModel.find(filter).sort({ createdAt: -1 });
        const images = records.map((image) => ({
            ...image.toObject(),
            category: getCategoryName(image.category),
        }));
        res.json({ success: true, images });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const listGalleryCategories = async (req, res) => {
    try {
        const records = await galleryModel.find({}, { category: 1 }).sort({ createdAt: 1 });
        const categories = new Map();

        records.forEach((record) => {
            const category = getCategoryName(record.category);
            const key = category.toLowerCase();
            if (!categories.has(key)) categories.set(key, category);
        });

        res.json({
            success: true,
            categories: [...categories.values()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const removeGalleryImage = async (req, res) => {
    try {
        await galleryModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Gallery image removed" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export { addGalleryImage, listGalleryCategories, listGalleryImages, removeGalleryImage };
