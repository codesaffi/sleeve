import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from "validator";
import userModel from "../models/userModel.js";
import otpModel from '../models/otpModel.js';
import { sendProfileOtpEmail } from '../utils/sendOrderEmail.js';

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
};

// ──────────────────────────────────────────────────────────────
// EXISTING: User login (unchanged)
// ──────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exists" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = createToken(user._id);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "invalid credentials" });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ──────────────────────────────────────────────────────────────
// EXISTING: User register (unchanged)
// ──────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong eight password" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({ name, email, password: hashedPassword });
        const user = await newUser.save();
        const token = createToken(user._id);

        res.json({ success: true, token });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ──────────────────────────────────────────────────────────────
// EXISTING: Admin login (unchanged)
// ──────────────────────────────────────────────────────────────
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "invalid creadentials" });
        }
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ──────────────────────────────────────────────────────────────
// NEW: Get logged-in user's profile
// ──────────────────────────────────────────────────────────────
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId).select('-password -cartData');

        if (!user) {
            return res.json({ success: false, message: 'User not found.' });
        }

        res.json({ success: true, user: { name: user.name, email: user.email } });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ──────────────────────────────────────────────────────────────
// NEW: Request email OTP for guest order history access
// ──────────────────────────────────────────────────────────────
const requestEmailOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = email?.toLowerCase().trim();

        if (!normalizedEmail || !validator.isEmail(normalizedEmail)) {
            return res.json({ success: false, message: 'Please enter a valid email address.' });
        }

        const user = await userModel.findOne({ email: normalizedEmail });
        if (user && user.password) {
            return res.json({ success: false, message: 'You already have an account. Please sign in with your password instead of using OTP.' });
        }

        // Rate-limit: check recent OTP attempts for this email (profile purpose)
        const existingOtp = await otpModel.findOne({
            email: normalizedEmail,
            verified: false,
            expiresAt: { $gt: new Date() },
            orderRef: { $regex: '^profile_' } // distinguish profile OTPs from order OTPs
        });

        if (existingOtp && existingOtp.resendCount >= 3) {
            return res.json({ success: false, message: 'Too many requests. Please wait before trying again.' });
        }

        // Cooldown: 60 seconds between sends
        if (existingOtp && existingOtp.lastResendAt) {
            const secondsSince = (Date.now() - new Date(existingOtp.lastResendAt).getTime()) / 1000;
            if (secondsSince < 60) {
                const wait = Math.ceil(60 - secondsSince);
                return res.json({ success: false, message: `Please wait ${wait} seconds before requesting another code.` });
            }
        }

        // Delete old profile OTPs for this email
        await otpModel.deleteMany({ email: normalizedEmail, orderRef: { $regex: '^profile_' } });

        // Generate new OTP
        const rawOtp = crypto.randomInt(100000, 999999).toString();
        const otpHash = await bcrypt.hash(rawOtp, 10);
        const orderRef = `profile_${crypto.randomUUID()}`; // prefix to distinguish from order OTPs
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await otpModel.create({
            email: normalizedEmail,
            otpHash,
            orderRef,
            pendingOrderData: { purpose: 'profile-access' },
            expiresAt,
            resendCount: 0,
            lastResendAt: new Date()
        });

        // Send OTP email
        try {
            await sendProfileOtpEmail(normalizedEmail, rawOtp);
        } catch (emailErr) {
            await otpModel.deleteMany({ email: normalizedEmail, orderRef: { $regex: '^profile_' } });
            console.error('Failed to send profile OTP email:', emailErr.message);
            return res.json({ success: false, message: 'Failed to send email. Please try again.' });
        }

        res.json({ success: true, message: 'Verification code sent to your email.', orderRef });

    } catch (error) {
        console.error('requestEmailOtp error:', error.message);
        res.json({ success: false, message: 'Something went wrong. Please try again.' });
    }
};

// ──────────────────────────────────────────────────────────────
// NEW: Verify email OTP and return short-lived emailToken
// ──────────────────────────────────────────────────────────────
const verifyEmailOtp = async (req, res) => {
    try {
        const { orderRef, otp } = req.body;

        if (!orderRef || !otp) {
            return res.json({ success: false, message: 'Reference and code are required.' });
        }

        const otpRecord = await otpModel.findOne({ orderRef });

        if (!otpRecord) {
            return res.json({ success: false, message: 'Invalid or expired session. Please request a new code.' });
        }

        if (otpRecord.verified) {
            return res.json({ success: false, message: 'This code has already been used.' });
        }

        if (new Date() > otpRecord.expiresAt) {
            return res.json({ success: false, message: 'Verification code has expired. Please request a new one.' });
        }

        if (otpRecord.attempts >= 5) {
            return res.json({ success: false, message: 'Too many incorrect attempts. Please request a new code.' });
        }

        const isMatch = await bcrypt.compare(otp.trim(), otpRecord.otpHash);
        if (!isMatch) {
            await otpModel.findByIdAndUpdate(otpRecord._id, { $inc: { attempts: 1 } });
            const remaining = 4 - otpRecord.attempts;
            return res.json({
                success: false,
                message: remaining > 0
                    ? `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
                    : 'Too many incorrect attempts. Please request a new code.'
            });
        }

        // Mark as verified
        await otpModel.findByIdAndUpdate(otpRecord._id, { verified: true });

        // Issue short-lived email token (expires in 1 hour)
        const emailToken = jwt.sign(
            { email: otpRecord.email, purpose: 'order-history' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            success: true,
            message: 'Email verified successfully.',
            emailToken,
            email: otpRecord.email
        });

    } catch (error) {
        console.error('verifyEmailOtp error:', error.message);
        res.json({ success: false, message: 'Something went wrong. Please try again.' });
    }
};

// ──────────────────────────────────────────────────────────────
// NEW: Check user status using emailToken
// ──────────────────────────────────────────────────────────────
const checkUserStatus = async (req, res) => {
    try {
        const emailTokenHeader = req.headers['x-email-token'];
        if (!emailTokenHeader) {
            return res.json({ success: false, message: 'Authentication required.' });
        }
        
        let decoded;
        try {
            decoded = jwt.verify(emailTokenHeader, process.env.JWT_SECRET);
        } catch {
            return res.json({ success: false, message: 'Invalid or expired session.' });
        }

        if (!decoded.email || decoded.purpose !== 'order-history') {
            return res.json({ success: false, message: 'Invalid session token.' });
        }

        const user = await userModel.findOne({ email: decoded.email });
        if (!user) {
            return res.json({ success: false, message: 'User not found.' });
        }

        res.json({
            success: true,
            hasPassword: !!user.password,
            emailVerified: user.emailVerified,
            email: user.email
        });
    } catch (error) {
        console.error('checkUserStatus error:', error.message);
        res.json({ success: false, message: 'Something went wrong.' });
    }
};

// ──────────────────────────────────────────────────────────────
// NEW: Create password for verified guest
// ──────────────────────────────────────────────────────────────
const createPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const emailTokenHeader = req.headers['x-email-token'];
        if (!emailTokenHeader) {
            return res.json({ success: false, message: 'Authentication required.' });
        }
        
        let decoded;
        try {
            decoded = jwt.verify(emailTokenHeader, process.env.JWT_SECRET);
        } catch {
            return res.json({ success: false, message: 'Invalid or expired session.' });
        }

        if (!decoded.email || decoded.purpose !== 'order-history') {
            return res.json({ success: false, message: 'Invalid session token.' });
        }

        if (!password || password.length < 8) {
            return res.json({ success: false, message: 'Password must be at least 8 characters long.' });
        }

        const user = await userModel.findOne({ email: decoded.email });
        if (!user) {
            return res.json({ success: false, message: 'User not found.' });
        }

        if (user.password) {
            return res.json({ success: false, message: 'Account already has a password. Please log in.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword;
        await user.save();

        const token = createToken(user._id);

        res.json({ success: true, message: 'Password created successfully', token });
    } catch (error) {
        console.error('createPassword error:', error.message);
        res.json({ success: false, message: 'Something went wrong.' });
    }
};

export { loginUser, registerUser, adminLogin, getUserProfile, requestEmailOtp, verifyEmailOtp, checkUserStatus, createPassword };