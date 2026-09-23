import express from "express";
import { addReview, getReviews, deleteReview } from "../controllers/reviewController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const reviewRouter = express.Router();

// Public: submit a customer review (optional image)
reviewRouter.post("/add", upload.single("image"), addReview);

// Public: get reviews for a product
reviewRouter.get("/list", getReviews);

// Admin only: delete a review
reviewRouter.post("/delete", adminAuth, deleteReview);

export default reviewRouter;
