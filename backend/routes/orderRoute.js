import express from 'express'
import { placeOrder, allOrders, userOrders, UpdateStatus, requestOrderVerification, verifyOrderOtp, resendOrderOtp, getOrdersByEmail, generateOrderReportPDF } from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

// Admin features (unchanged)
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/status', adminAuth, UpdateStatus)
orderRouter.post('/report-pdf', adminAuth, generateOrderReportPDF)

// Logged-in user order placement (unchanged)
orderRouter.post('/place', authUser, placeOrder)

// Logged-in user order history (unchanged)
orderRouter.post('/userorders', authUser, userOrders)

// Guest checkout — OTP flow (public routes)
orderRouter.post('/request-verification', requestOrderVerification)
orderRouter.post('/verify-otp', verifyOrderOtp)
orderRouter.post('/resend-otp', resendOrderOtp)

// Guest order history — requires x-email-token header (issued after email OTP verification)
orderRouter.get('/orders-by-email', getOrdersByEmail)

export default orderRouter