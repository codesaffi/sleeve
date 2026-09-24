import express from 'express';
import { createDiscount, getAllDiscounts, deleteDiscount, updateDiscountStatus, validateDiscount } from '../controllers/discountController.js';
import adminAuth from '../middleware/adminAuth.js';

const discountRouter = express.Router();

// Admin routes
discountRouter.post('/create', adminAuth, createDiscount);
discountRouter.get('/list', adminAuth, getAllDiscounts);
discountRouter.post('/delete', adminAuth, deleteDiscount);
discountRouter.post('/status', adminAuth, updateDiscountStatus);

// Customer route
discountRouter.post('/validate', validateDiscount);

export default discountRouter;
