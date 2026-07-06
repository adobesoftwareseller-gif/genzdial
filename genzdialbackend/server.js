require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Razorpay = require('razorpay');

// Routes
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const reelRoutes = require('./routes/reelRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const mediaLogosRoutes = require('./routes/mediaLogoRoutes');
const faqRoutes = require('./routes/faqRoutes');
const promoMessageRoutes = require('./routes/promoMessageRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const couponRoutes = require('./routes/couponRoutes');
const pageRoutes = require('./routes/pageRoutes');

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true })); // CORS ko enable kiya hai
app.use(express.json({ limit: '25mb' }));

// Serve uploaded files (reels, banners, etc.) as static assets.
// UPLOADS_ROOT lets us point at a persistent disk in production (e.g. Render).
const UPLOADS_ROOT = process.env.UPLOADS_ROOT || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(UPLOADS_ROOT));

// Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/media-logos', mediaLogosRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/promo-messages', promoMessageRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/pages', pageRoutes);

// Database connection (shared across Render + Vercel).
// On Vercel the process is reused between invocations, so we cache the
// connection promise and reuse it instead of reconnecting every request.
let dbPromise = null;
function bootstrap() {
    if (mongoose.connection.readyState === 1) return Promise.resolve();
    if (!dbPromise) {
        dbPromise = mongoose.connect(process.env.MONGO_URI, {
            // Serverless-friendly options: fail fast instead of hanging for
            // 30s+ when Atlas is unreachable, and keep the per-instance pool
            // small (each Vercel lambda has its own pool).
            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS: 20000,
            maxPoolSize: 5,
            minPoolSize: 0,
        }).catch((err) => {
            dbPromise = null; // allow retry on next invocation
            console.error("DB Connection Error:", err);
            throw err;
        });
    }
    return dbPromise;
}

// Only start a long-lived HTTP server when run directly (e.g. Render / local).
// On Vercel, api/index.js imports { app, bootstrap } instead.
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    bootstrap()
        .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
        .catch(err => console.error("Startup failed:", err));
}

module.exports = { app, bootstrap };