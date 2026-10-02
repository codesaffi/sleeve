import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    discountPercentage: { type: Number, required: true, min: 1, max: 100 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const discountModel = mongoose.models.discount || mongoose.model('discount', discountSchema);
export default discountModel;
