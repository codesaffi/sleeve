import discountModel from "../models/discountModel.js";

// Create discount
const createDiscount = async (req, res) => {
    try {
        const { customerName, code, discountPercentage, isActive } = req.body;
        
        if(!customerName || !code || !discountPercentage) {
            return res.json({success: false, message: "Please provide all required fields."});
        }
        if(discountPercentage <= 0 || discountPercentage > 100) {
            return res.json({success: false, message: "Discount percentage must be between 1 and 100."});
        }

        const normalizedCode = code.trim().toUpperCase();

        const exists = await discountModel.findOne({code: normalizedCode});
        if(exists) {
            return res.json({success: false, message: "Discount code already exists."});
        }

        const newDiscount = new discountModel({
            customerName: customerName.trim(),
            code: normalizedCode,
            discountPercentage,
            isActive: isActive !== undefined ? isActive : true
        });

        await newDiscount.save();

        res.json({success: true, message: "Discount code created successfully."});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
};

// Get all discounts
const getAllDiscounts = async (req, res) => {
    try {
        const discounts = await discountModel.find({}).sort({createdAt: -1});
        res.json({success: true, discounts});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
};

// Delete discount
const deleteDiscount = async (req, res) => {
    try {
        const { id } = req.body;
        await discountModel.findByIdAndDelete(id);
        res.json({success: true, message: "Discount code deleted."});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
};

// Update status
const updateDiscountStatus = async (req, res) => {
    try {
        const { id, isActive } = req.body;
        await discountModel.findByIdAndUpdate(id, { isActive });
        res.json({success: true, message: "Discount code status updated."});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
};

// Validate discount (Customer side)
const validateDiscount = async (req, res) => {
    try {
        const { code } = req.body;
        if(!code) return res.json({success: false, message: "Please enter a discount code."});
        
        const normalizedCode = code.trim().toUpperCase();
        
        const discount = await discountModel.findOne({code: normalizedCode});
        if(!discount) return res.json({success: false, message: "Invalid discount code."});
        
        if(!discount.isActive) return res.json({success: false, message: "This discount code is no longer active."});
        if(discount.isUsed) return res.json({success: false, message: "This discount code has already been used."});
        
        res.json({success: true, discountPercentage: discount.discountPercentage, code: discount.code});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
};

export { createDiscount, getAllDiscounts, deleteDiscount, updateDiscountStatus, validateDiscount };
