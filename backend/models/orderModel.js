import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    userId: { type: String, default: '' },           // empty string for guest orders
    guestEmail: { type: String, default: '' },       // used for guest order history lookup
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, required: true, default: 'Order Placed' },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, required: true, default: false },
    date: { type: Number, required: true },
    marketingConsent: { type: Boolean, default: false }, // opt-in marketing preference
    verified: { type: Boolean, default: true },          // false only during pending guest OTP flow (not stored here), always true on final save
})

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema)
export default orderModel;