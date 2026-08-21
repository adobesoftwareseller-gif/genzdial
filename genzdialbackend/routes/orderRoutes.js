const express = require('express');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const User = require('../models/User');
const Settings = require('../models/Settings'); // <-- NAYA IMPORT
const { authRequired } = require('../middleware/auth');
const { resolveCoupon } = require('./couponRoutes');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'dev-secret';

// User auth middleware
function userAuth(req, res, next) {
    const header = req.headers.userauthorization || req.headers['user-authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Login required' });
    try {
        const payload = jwt.verify(token, SECRET);
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid session' });
    }
}

// Razorpay Instance Setup
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// NAYA HELPER: hamesha DB se current shipping fee fetch karega
async function getCurrentShippingFee() {
    const s = await Settings.findOne({ key: 'shipping' });
    return s ? Number(s.shippingFee) : 99;
}

// API 1: CREATE RAZORPAY ORDER
router.post('/create-razorpay-order', userAuth, async (req, res) => {
    try {
        const { subtotal, couponCode, boxFee } = req.body; // <- 'shipping' yahan se hata diya
        const shipping = await getCurrentShippingFee(); // <- NAYI LINE

        let discount = 0;
        if (couponCode) {
            try {
                const coupon = await resolveCoupon(couponCode, subtotal);
                discount = coupon.discount || 0;
            } catch (e) {
                console.error("Coupon validation failed:", e.message);
            }
        }

        const finalTotal = Math.max(0, Number(subtotal) + shipping + Number(boxFee || 0) - discount);
        if (finalTotal <= 0) return res.status(400).json({ message: 'Invalid total amount' });

        const options = {
            amount: Math.round(finalTotal * 100),
            currency: "INR",
            receipt: `rcpt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        const rzpMsg = err?.error?.description || err?.message || 'Could not start payment';
        console.error("create-razorpay-order failed:", rzpMsg, err?.error || '');
        res.status(err?.statusCode || 500).json({ message: rzpMsg });
    }
});

// API 2: VERIFY PAYMENT & SAVE ORDER TO DB
router.post('/verify-payment', userAuth, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Payment signature verification failed!" });
        }

        const { items, address, subtotal, couponCode, boxFee, withBox } = orderData; // <- 'shipping' yahan se hata diya
        const shipping = await getCurrentShippingFee(); // <- NAYI LINE

        let discount = 0;
        let appliedCode = '';
        if (couponCode) {
            try {
                const coupon = await resolveCoupon(couponCode, subtotal);
                discount = coupon.discount || 0;
                appliedCode = coupon.code || '';
            } catch (e) {}
        }

        const finalTotal = Math.max(0, Number(subtotal) + shipping + Number(boxFee || 0) - discount);

        const user = await User.findById(req.user.uid);
        if (!user) return res.status(401).json({ message: 'User not found' });

        const order = await Order.create({
            userId: user._id,
            userName: address.fullName || user.name,
            userPhone: address.phone || user.phone,
            items: items.map((i) => ({
                productId: i._id || i.productId,
                name: i.name,
                brand: i.brand,
                image: i.image,
                price: i.price,
                qty: i.qty,
            })),
            address,
            subtotal,
            shipping,
            withBox: !!withBox,
            boxFee: Number(boxFee) || 0,
            discount: discount,
            couponCode: appliedCode,
            total: finalTotal,
            paymentRef: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            paymentStatus: "paid",
            status: 'confirmed',
        });

        return res.status(201).json({
            success: true,
            message: "Payment verified and order placed successfully",
            order: order
        });
    } catch (err) {
        console.error("Verification Error:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// API 3: GET LOGGED-IN USER'S ORDERS  (used by "My Orders" page)
router.get('/mine', userAuth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.uid }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error("Fetch my orders error:", err);
        res.status(500).json({ message: err.message });
    }
});

// API 4: GET ALL ORDERS  (admin only, used by Admin → Orders)
router.get('/admin', authRequired, async (_req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error("Fetch admin orders error:", err);
        res.status(500).json({ message: err.message });
    }
});

// API 5: UPDATE ORDER STATUS  (admin only)
router.patch('/admin/:id', authRequired, async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        console.error("Update order status error:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;