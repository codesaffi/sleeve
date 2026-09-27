import express from "express";
import {addProduct,listProducts,removeProduct,singleProduct,editProductStock,editProduct,generateInventoryPDF} from '../controllers/productController.js';
import { uploadProductImages } from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();

const handleProductImageUpload = (req, res, next) => {
    uploadProductImages(req, res, (error) => {
        if (!error) return next();

        const message = error.code === "LIMIT_UNEXPECTED_FILE"
            ? "A maximum of 4 product images is allowed."
            : error.message;
        return res.status(400).json({ success: false, message });
    });
};

productRouter.post('/add', adminAuth, handleProductImageUpload, addProduct);
productRouter.post('/remove',adminAuth,removeProduct);
productRouter.post('/single',singleProduct);
productRouter.get('/list',listProducts);
productRouter.post('/editStock', adminAuth, editProductStock);
productRouter.post('/edit', adminAuth, editProduct);
productRouter.get('/inventory-pdf', adminAuth, generateInventoryPDF);

export default productRouter