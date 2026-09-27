import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "uploads/");
    },

    filename: function (req, file, callback) {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        callback(null, uniqueName);
    }
});

const upload = multer({ storage });
const productImageUpload = multer({
    storage,
    fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith("image/")) {
            callback(new Error("Product images must be image files."));
            return;
        }
        callback(null, true);
    }
});

export default upload;
export const uploadProductImages = productImageUpload.array("images", 4);