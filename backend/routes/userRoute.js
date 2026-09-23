import express from "express";
import { loginUser, registerUser, adminLogin, getUserProfile, requestEmailOtp, verifyEmailOtp, checkUserStatus, createPassword } from '../controllers/userController.js';
import authUser from '../middleware/auth.js';

const userRouter = express.Router();

// Existing routes (unchanged)
userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)

// New: logged-in user profile
userRouter.get('/profile', authUser, getUserProfile)

// New: guest email OTP for order history access (public)
userRouter.post('/request-email-otp', requestEmailOtp)
userRouter.post('/verify-email-otp', verifyEmailOtp)
userRouter.get('/check-status', checkUserStatus)
userRouter.post('/create-password', createPassword)

export default userRouter;