import { v2 as cloudinary } from "cloudinary"

const connectCloudinary = async () => {
    // Prefer CLOUDINARY_URL if provided (cloudinary://API_KEY:API_SECRET@CLOUD_NAME)
    if (process.env.CLOUDINARY_URL) {
        cloudinary.config({ url: process.env.CLOUDINARY_URL });
    } else {
        // Trim env values to avoid accidental whitespace/newlines
        const cloud_name = process.env.CLOUDINARY_NAME && process.env.CLOUDINARY_NAME.trim();
        const api_key = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY.trim();
        const api_secret = process.env.CLOUDINARY_SECRET_KEY && process.env.CLOUDINARY_SECRET_KEY.trim();

        cloudinary.config({
            cloud_name,
            api_key,
            api_secret,
            secure: true
        });
    }

    try {
        await cloudinary.api.ping();
    } catch (error) {
        console.error("Cloudinary connection error");
    }
};

export default connectCloudinary;