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

// Serve uploaded files (reels, banners, etc.) as static assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Database & Server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.error("DB Connection Error:", err));