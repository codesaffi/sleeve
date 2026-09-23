import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true, lowercase: true, trim: true },
    otpHash: { type: String, required: true },        // bcrypt-hashed OTP — never store plaintext
    orderRef: { type: String, required: true, unique: true }, // unique reference for this verification attempt
    pendingOrderData: { type: Object, required: true }, // full checkout data stored until OTP verified
    expiresAt: { type: Date, required: true },          // OTP expiry (10 minutes)
    verified: { type: Boolean, default: false },         // becomes true after successful verification
    attempts: { type: Number, default: 0 },              // failed verification attempts
    resendCount: { type: Number, default: 0 },           // how many times OTP was resent
    lastResendAt: { type: Date, default: null },          // timestamp of last resend
    orderId: { type: String, default: null },             // populated after order is confirmed
}, { timestamps: true });

// Auto-remove documents 1 hour after creation (TTL index)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

const otpModel = mongoose.models.otp || mongoose.model('otp', otpSchema);

export default otpModel;
