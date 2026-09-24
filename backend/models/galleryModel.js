import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema({
    image: { type: String, required: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
}, { timestamps: true });

const galleryModel = mongoose.models.gallery || mongoose.model("gallery", gallerySchema);
export default galleryModel;
