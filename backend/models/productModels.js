import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, default: 0 },
    minimumPosterQuantity: { type: Number, min: 1 },
    basePosterQuantity: { type: Number, min: 1 },
    basePosterPrice: { type: Number, min: 0 },
    singlePosterPrice: { type: Number, min: 0 },
    image: { type: Array, default: [] },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    sizes: { type: Array, required: false, default: [] },
    stock: { type: Number, required: true, default: 0 },
    bestseller: { type: Boolean },
    date: { type: Number, required: true },
    comingSoon: { type: Boolean, default: false },
    specifications: {
        type: [{ name: { type: String }, value: { type: String } }],
        default: []
    }
})

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel