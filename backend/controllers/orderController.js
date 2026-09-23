import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import otpModel from "../models/otpModel.js";
import sendOrderEmail, { sendOtpEmail, sendCustomerConfirmationEmail } from "../utils/sendOrderEmail.js";
import PDFDocument from "pdfkit-table";

// ──────────────────────────────────────────────────────────────
// EXISTING: Place order (logged-in users only — unchanged)
// ──────────────────────────────────────────────────────────────
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        res.json({ success: true, message: "Order Placed Successfully" });

        // Side-effects after response
        sendOrderEmail(req.body).catch((err) => console.error('Failed to send admin order email:', err));
        userModel.findByIdAndUpdate(userId, { cartData: {} }).catch((err) => console.error('Failed to clear user cart:', err));

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ──────────────────────────────────────────────────────────────
// EXISTING: All orders for admin panel (unchanged)
// ──────────────────────────────────────────────────────────────
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ──────────────────────────────────────────────────────────────
// EXISTING: User's own orders (unchanged)
// ──────────────────────────────────────────────────────────────
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await orderModel.find({ userId });
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ──────────────────────────────────────────────────────────────
// EXISTING: Update order status (admin — unchanged)
// ──────────────────────────────────────────────────────────────
const UpdateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: 'Status Updated' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ──────────────────────────────────────────────────────────────
// NEW: Step 1 — Request order verification (guest checkout)
// Validates checkout data, creates OTP, sends OTP email
// ──────────────────────────────────────────────────────────────
const requestOrderVerification = async (req, res) => {
    try {
        const { address, items, amount, paymentMethod, marketingConsent, userId } = req.body;

        // Basic validation
        if (!address || !items || !amount || !paymentMethod) {
            return res.json({ success: false, message: 'Missing required order information.' });
        }

        const email = address.email?.toLowerCase().trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.json({ success: false, message: 'A valid email address is required.' });
        }

        if (!address.firstName || !address.lastName || !address.phone || !address.street || !address.city || !address.state || !address.country) {
            return res.json({ success: false, message: 'Please fill in all delivery information fields.' });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.json({ success: false, message: 'Your cart is empty.' });
        }

        // Generate a cryptographically secure 6-digit OTP
        const rawOtp = crypto.randomInt(100000, 999999).toString();

        // Hash the OTP — never store plaintext
        const otpHash = await bcrypt.hash(rawOtp, 10);

        // Unique order reference for this verification attempt
        const orderRef = crypto.randomUUID();

        // Check for existing unverified OTP for this email — enforce resend limits
        const existingOtp = await otpModel.findOne({
            email,
            verified: false,
            expiresAt: { $gt: new Date() }
        });

        if (existingOtp && existingOtp.resendCount >= 3) {
            const cooldown = new Date(existingOtp.lastResendAt);
            cooldown.setMinutes(cooldown.getMinutes() + 15);
            if (new Date() < cooldown) {
                return res.json({
                    success: false,
                    message: 'Too many OTP requests. Please wait 15 minutes before trying again.'
                });
            }
        }

        // Remove any previous unverified OTP records for this email to avoid stale data
        await otpModel.deleteMany({ email, verified: false });

        // Store pending order data with hashed OTP
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const otpRecord = new otpModel({
            email,
            otpHash,
            orderRef,
            pendingOrderData: { address, items, amount, paymentMethod, marketingConsent: !!marketingConsent, userId: userId || '' },
            expiresAt,
            resendCount: 0
        });
        await otpRecord.save();

        // Send OTP email — if this fails, we clean up and return error
        try {
            await sendOtpEmail(email, rawOtp, address.firstName);
        } catch (emailErr) {
            await otpModel.findByIdAndDelete(otpRecord._id);
            console.error('Failed to send OTP email:', emailErr.message);
            return res.json({ success: false, message: 'Failed to send verification email. Please check your email address and try again.' });
        }

        // Never return the OTP in the response
        res.json({
            success: true,
            message: 'Verification code sent to your email.',
            orderRef,
            email
        });

    } catch (error) {
        console.error('requestOrderVerification error:', error.message);
        res.json({ success: false, message: 'Something went wrong. Please try again.' });
    }
};

// ──────────────────────────────────────────────────────────────
// NEW: Step 2 — Verify OTP and confirm order
// Creates the actual order only after successful verification
// ──────────────────────────────────────────────────────────────
const verifyOrderOtp = async (req, res) => {
    try {
        const { orderRef, otp } = req.body;

        if (!orderRef || !otp) {
            return res.json({ success: false, message: 'Order reference and verification code are required.' });
        }

        const otpRecord = await otpModel.findOne({ orderRef });

        if (!otpRecord) {
            return res.json({ success: false, message: 'Invalid or expired verification session. Please start over.' });
        }

        // Check if already confirmed — prevent duplicate order creation
        if (otpRecord.verified) {
            return res.json({ success: false, message: 'This order has already been confirmed.' });
        }

        // Check expiry
        if (new Date() > otpRecord.expiresAt) {
            return res.json({ success: false, message: 'Verification code has expired. Please request a new one.' });
        }

        // Enforce max attempts (5)
        if (otpRecord.attempts >= 5) {
            return res.json({ success: false, message: 'Too many incorrect attempts. Please request a new verification code.' });
        }

        // Verify OTP
        const isMatch = await bcrypt.compare(otp.trim(), otpRecord.otpHash);

        if (!isMatch) {
            // Increment attempts
            await otpModel.findByIdAndUpdate(otpRecord._id, { $inc: { attempts: 1 } });
            const remaining = 4 - otpRecord.attempts;
            return res.json({
                success: false,
                message: remaining > 0
                    ? `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
                    : 'Too many incorrect attempts. Please request a new verification code.'
            });
        }

        // OTP is correct — mark as verified immediately to prevent race condition
        await otpModel.findByIdAndUpdate(otpRecord._id, { verified: true });

        const { address, items, amount, paymentMethod, marketingConsent, userId } = otpRecord.pendingOrderData;

        let finalUserId = userId || '';
        
        // Find or create user for guest checkout to mark email as verified
        if (!finalUserId) {
            let user = await userModel.findOne({ email: otpRecord.email });
            if (!user) {
                user = new userModel({
                    name: `${address.firstName} ${address.lastName}`.trim(),
                    email: otpRecord.email,
                    password: '',
                    emailVerified: true
                });
                await user.save();
            } else if (!user.emailVerified) {
                user.emailVerified = true;
                await user.save();
            }
            finalUserId = user._id.toString();
        } else {
            let user = await userModel.findById(finalUserId);
            if (user && !user.emailVerified) {
                user.emailVerified = true;
                await user.save();
            }
        }

        // Create the confirmed order
        const orderData = {
            userId: finalUserId,
            guestEmail: otpRecord.email,
            items,
            address,
            amount,
            paymentMethod,
            payment: false,
            date: Date.now(),
            marketingConsent: !!marketingConsent
        };

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        // Store orderId on OTP record for reference
        await otpModel.findByIdAndUpdate(otpRecord._id, { orderId: newOrder._id.toString() });

        // Clear cart if user was logged in
        if (userId) {
            userModel.findByIdAndUpdate(userId, { cartData: {} })
                .catch((err) => console.error('Failed to clear user cart:', err));
        }

        // Send customer confirmation email (non-blocking)
        sendCustomerConfirmationEmail({ address, items, amount, paymentMethod }, newOrder._id.toString())
            .catch((err) => console.error('Failed to send customer confirmation email:', err));

        // Send admin notification email (non-blocking)
        sendOrderEmail({ address, items, amount, paymentMethod })
            .catch((err) => console.error('Failed to send admin order email:', err));

        // Issue short-lived email token so they can access their profile without another OTP
        const emailToken = jwt.sign(
            { email: otpRecord.email, purpose: 'order-history' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            success: true,
            message: 'Order confirmed successfully!',
            orderId: newOrder._id.toString(),
            emailToken
        });

    } catch (error) {
        console.error('verifyOrderOtp error:', error.message);
        res.json({ success: false, message: 'Something went wrong. Please try again.' });
    }
};

// ──────────────────────────────────────────────────────────────
// NEW: Resend OTP (rate-limited)
// ──────────────────────────────────────────────────────────────
const resendOrderOtp = async (req, res) => {
    try {
        const { orderRef } = req.body;

        if (!orderRef) {
            return res.json({ success: false, message: 'Order reference is required.' });
        }

        const otpRecord = await otpModel.findOne({ orderRef });

        if (!otpRecord) {
            return res.json({ success: false, message: 'Invalid or expired verification session. Please start over.' });
        }

        if (otpRecord.verified) {
            return res.json({ success: false, message: 'This order has already been confirmed.' });
        }

        // Rate limit: max 3 resends
        if (otpRecord.resendCount >= 3) {
            return res.json({ success: false, message: 'Maximum resend limit reached. Please start a new order.' });
        }

        // Cooldown: 60 seconds between resends
        if (otpRecord.lastResendAt) {
            const secondsSinceLastResend = (Date.now() - new Date(otpRecord.lastResendAt).getTime()) / 1000;
            if (secondsSinceLastResend < 60) {
                const waitSeconds = Math.ceil(60 - secondsSinceLastResend);
                return res.json({ success: false, message: `Please wait ${waitSeconds} seconds before requesting another code.` });
            }
        }

        // Generate new OTP
        const rawOtp = crypto.randomInt(100000, 999999).toString();
        const otpHash = await bcrypt.hash(rawOtp, 10);

        // Reset attempts, update hash, extend expiry
        const newExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await otpModel.findByIdAndUpdate(otpRecord._id, {
            otpHash,
            expiresAt: newExpiry,
            attempts: 0,
            resendCount: otpRecord.resendCount + 1,
            lastResendAt: new Date()
        });

        // Send new OTP
        try {
            await sendOtpEmail(otpRecord.email, rawOtp, otpRecord.pendingOrderData?.address?.firstName);
        } catch (emailErr) {
            console.error('Failed to resend OTP email:', emailErr.message);
            return res.json({ success: false, message: 'Failed to send verification email. Please try again.' });
        }

        res.json({ success: true, message: 'New verification code sent to your email.' });

    } catch (error) {
        console.error('resendOrderOtp error:', error.message);
        res.json({ success: false, message: 'Something went wrong. Please try again.' });
    }
};

// ──────────────────────────────────────────────────────────────
// NEW: Get orders by verified email (guest order history)
// Requires emailToken header (short-lived JWT issued after email OTP verification)
// ──────────────────────────────────────────────────────────────
const getOrdersByEmail = async (req, res) => {
    try {
        const emailTokenHeader = req.headers['x-email-token'];

        if (!emailTokenHeader) {
            return res.json({ success: false, message: 'Authentication required.' });
        }

        let decoded;
        try {
            decoded = jwt.verify(emailTokenHeader, process.env.JWT_SECRET);
        } catch {
            return res.json({ success: false, message: 'Invalid or expired session. Please verify your email again.' });
        }

        if (!decoded.email || decoded.purpose !== 'order-history') {
            return res.json({ success: false, message: 'Invalid session token.' });
        }

        const email = decoded.email;
        const orders = await orderModel.find({
            $or: [
                { guestEmail: email },
                { 'address.email': email }
            ]
        }).sort({ date: -1 });

        res.json({ success: true, orders });

    } catch (error) {
        console.error('getOrdersByEmail error:', error.message);
        res.json({ success: false, message: 'Something went wrong. Please try again.' });
    }
};

const generateOrderReportPDF = async (req, res) => {
    try {
        const { type, date, startDate, endDate, month, year, orderId } = req.body;
        
        let query = {};
        let reportTitle = "ORDER REPORT";
        let dateSubtitle = "";

        if (type === 'single') {
            query = { _id: orderId };
            reportTitle = `ORDER RECEIPT`;
            dateSubtitle = `Order ID: ${orderId}`;
        } else if (type === 'daily') {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            
            query = { date: { $gte: startOfDay.getTime(), $lte: endOfDay.getTime() } };
            reportTitle = "DAILY ORDER REPORT";
            dateSubtitle = `Date: ${new Date(date).toLocaleDateString()}`;
        } else if (type === 'weekly') {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            
            query = { date: { $gte: start.getTime(), $lte: end.getTime() } };
            reportTitle = "WEEKLY ORDER REPORT";
            dateSubtitle = `From: ${start.toLocaleDateString()} To: ${end.toLocaleDateString()}`;
        } else if (type === 'monthly') {
            const startOfMonth = new Date(year, month - 1, 1);
            const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
            
            query = { date: { $gte: startOfMonth.getTime(), $lte: endOfMonth.getTime() } };
            reportTitle = "MONTHLY ORDER REPORT";
            dateSubtitle = `Month: ${month}/${year}`;
        }

        const orders = await orderModel.find(query).sort({ date: -1 });

        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${type}-report.pdf`);
        
        doc.pipe(res);

        doc.fontSize(20).text("GEAR.", { align: 'center' });
        doc.fontSize(16).text(reportTitle, { align: 'center' });
        doc.moveDown();
        if (dateSubtitle) {
            doc.fontSize(10).text(dateSubtitle);
        }
        doc.text(`Generated: ${new Date().toLocaleString()}`);
        doc.moveDown();

        if (type === 'single' && orders.length > 0) {
            const order = orders[0];
            doc.font("Helvetica-Bold").text("CUSTOMER DETAILS");
            doc.font("Helvetica").text(`Name: ${order.address.firstName} ${order.address.lastName}`);
            doc.text(`Email: ${order.address.email}`);
            doc.text(`Phone: ${order.address.phone}`);
            doc.text(`Address: ${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.country}`);
            doc.moveDown();

            doc.font("Helvetica-Bold").text("ORDER DETAILS");
            doc.font("Helvetica").text(`Status: ${order.status}`);
            doc.text(`Payment Method: ${order.paymentMethod}`);
            doc.text(`Payment Status: ${order.payment ? 'Paid' : 'Pending'}`);
            doc.moveDown();

            const table = {
                headers: [
                    { label: "Product", property: 'name', width: 250 },
                    { label: "Qty", property: 'qty', width: 50 },
                    { label: "Price", property: 'price', width: 100 },
                    { label: "Subtotal", property: 'subtotal', width: 100 }
                ],
                datas: order.items.map(item => ({
                    name: `${item.name} ${item.size && item.size !== 'Default' ? `(${item.size})` : ''}`,
                    qty: item.quantity.toString(),
                    price: `Rs ${item.price}`,
                    subtotal: `Rs ${item.price * item.quantity}`
                }))
            };
            await doc.table(table, {
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
                prepareRow: () => doc.font("Helvetica").fontSize(10),
            });

            doc.moveDown();
            doc.fontSize(14).font("Helvetica-Bold").text(`Total Amount: Rs ${order.amount}`, { align: 'right' });

        } else {
            const totalSales = orders.reduce((acc, o) => acc + o.amount, 0);
            const paidOrders = orders.filter(o => o.payment).length;
            const avgOrderValue = orders.length > 0 ? (totalSales / orders.length).toFixed(2) : 0;

            doc.font("Helvetica-Bold").text("SUMMARY");
            doc.font("Helvetica").text(`Total Orders: ${orders.length}`);
            doc.text(`Total Sales: Rs ${totalSales}`);
            doc.text(`Average Order Value: Rs ${avgOrderValue}`);
            doc.text(`Paid Orders: ${paidOrders}`);
            doc.text(`Unpaid Orders: ${orders.length - paidOrders}`);
            doc.moveDown();

            if (orders.length > 0) {
                const table = {
                    headers: [
                        { label: "Order ID", property: 'id', width: 80 },
                        { label: "Date", property: 'date', width: 70 },
                        { label: "Customer", property: 'customer', width: 90 },
                        { label: "Items", property: 'items', width: 40 },
                        { label: "Amount", property: 'amount', width: 60 },
                        { label: "Method", property: 'method', width: 50 },
                        { label: "Status", property: 'status', width: 60 }
                    ],
                    datas: orders.map(o => ({
                        id: o._id.toString().slice(-8),
                        date: new Date(o.date).toLocaleDateString(),
                        customer: `${o.address.firstName} ${o.address.lastName}`,
                        items: o.items.reduce((acc, i) => acc + i.quantity, 0).toString(),
                        amount: `Rs ${o.amount}`,
                        method: o.paymentMethod,
                        status: o.status
                    }))
                };
                await doc.table(table, {
                    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
                    prepareRow: () => doc.font("Helvetica").fontSize(8),
                });
            } else {
                doc.text("No orders found for this period.");
            }
        }

        doc.end();

    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export { placeOrder, allOrders, userOrders, UpdateStatus, requestOrderVerification, verifyOrderOtp, resendOrderOtp, getOrdersByEmail, generateOrderReportPDF };