import { v2 as cloudinary } from "cloudinary";
import path from "path";
import reviewModel from "../models/reviewModel.js";
import productModel from "../models/productModels.js";

// Add a review (customer or admin)
const addReview = async (req, res) => {
    try {
        const { productId, name, email, rating, review, source } = req.body;

        // Validate required fields
        if (!productId) return res.json({ success: false, message: "Product ID is required" });
        if (!name || !name.trim()) return res.json({ success: false, message: "Name is required" });
        if (!rating) return res.json({ success: false, message: "Rating is required" });
        if (!review || !review.trim()) return res.json({ success: false, message: "Review text is required" });

        const ratingNum = Number(rating);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return res.json({ success: false, message: "Rating must be between 1 and 5" });
        }

        // Validate productId exists
        const product = await productModel.findById(productId);
        if (!product) return res.json({ success: false, message: "Product not found" });

        // Handle optional image upload
        let imageUrl = "";
        if (req.file) {
            const fullPath = path.resolve(req.file.path);
            const result = await cloudinary.uploader.upload(fullPath, { resource_type: "image" });
            imageUrl = result.secure_url;
        }

        const reviewData = {
            productId,
            name: name.trim(),
            email: email ? email.trim() : "",
            rating: ratingNum,
            review: review.trim(),
            image: imageUrl,
            source: source === "admin" ? "admin" : "customer"
        };

        const newReview = new reviewModel(reviewData);
        await newReview.save();

        res.json({ success: true, message: "Review added successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get all reviews for a specific product
const getReviews = async (req, res) => {
    try {
        const { productId } = req.query;
        if (!productId) return res.json({ success: false, message: "Product ID is required" });

        const reviews = await reviewModel.find({ productId }).sort({ date: -1 });

        const totalReviews = reviews.length;
        const avgRating = totalReviews > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0;

        res.json({
            success: true,
            reviews,
            totalReviews,
            avgRating: Math.round(avgRating * 10) / 10
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete a review (admin only)
const deleteReview = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.json({ success: false, message: "Review ID is required" });

        await reviewModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export { addReview, getReviews, deleteReview };
