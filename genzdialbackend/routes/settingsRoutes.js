const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Settings = require('../models/Settings');
const { authRequired } = require('../middleware/auth');
const { isConfigured: cloudinaryOn, uploadBuffer, destroyByUrl } = require('../config/cloudinary');

const router = express.Router();

const UPLOADS_ROOT = process.env.UPLOADS_ROOT || path.join(__dirname, '..', 'uploads');
const uploadDir = path.join(UPLOADS_ROOT, 'qr');
if (!cloudinaryOn && !fs.existsSync(uploadDir)) {
    try { fs.mkdirSync(uploadDir, { recursive: true }); } catch (_) { /* read-only FS */ }
}

const storage = cloudinaryOn
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadDir),
        filename: (_req, file, cb) => {
            const safe = file.originalname.replace(/[^a-z0-9.\-_]/gi, '_');
            cb(null, `${Date.now()}-${safe}`);
        },
    });

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        if (/^image\//.test(file.mimetype)) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    },
});

const SINGLETON_KEY = 'payment';

async function getOrCreate() {
    let s = await Settings.findOne({ key: SINGLETON_KEY });
    if (!s) s = await Settings.create({ key: SINGLETON_KEY });
    return s;
}

// GET /api/settings/payment   (public)
router.get('/payment', async (_req, res) => {
    const s = await getOrCreate();
    res.json({
        paymentQr: s.paymentQr || '',
        upiId: s.upiId || '',
        payeeName: s.payeeName || '',
    });
});

// PUT /api/settings/payment   (admin)
router.put('/payment', authRequired, async (req, res) => {
    try {
        const s = await getOrCreate();
        const { paymentQr, upiId, payeeName } = req.body;
        if (paymentQr !== undefined) s.paymentQr = paymentQr;
        if (upiId !== undefined) s.upiId = upiId;
        if (payeeName !== undefined) s.payeeName = payeeName;
        await s.save();
        res.json(s);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// POST /api/settings/payment/qr   (admin, multipart)
router.post('/payment/qr', authRequired, upload.single('qr'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const s = await getOrCreate();
        let url;
        if (cloudinaryOn) {
            const result = await uploadBuffer(req.file.buffer, { folder: 'genzdial/qr', resourceType: 'image' });
            url = result.secure_url;
            if (s.paymentQr) destroyByUrl(s.paymentQr, 'image');
        } else {
            url = `/uploads/qr/${req.file.filename}`;
            if (s.paymentQr && s.paymentQr.startsWith('/uploads/qr/')) {
                const prev = path.join(__dirname, '..', s.paymentQr);
                fs.promises.unlink(prev).catch(() => { });
            }
        }
        s.paymentQr = url;
        await s.save();
        res.json({ url });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ==================== NAYA CODE YAHAN SE SHURU ====================

const SHIPPING_KEY = 'shipping';

async function getOrCreateShipping() {
    let s = await Settings.findOne({ key: SHIPPING_KEY });
    if (!s) s = await Settings.create({ key: SHIPPING_KEY, shippingFee: 99 });
    return s;
}

// GET /api/settings/shipping-fee   (public - checkout page use karega)
router.get('/shipping-fee', async (_req, res) => {
    const s = await getOrCreateShipping();
    res.json({ shippingFee: s.shippingFee });
});

// PUT /api/settings/shipping-fee   (admin - change karne ke liye)
router.put('/shipping-fee', authRequired, async (req, res) => {
    try {
        const { amount } = req.body;
        if (amount === undefined || Number(amount) < 0) {
            return res.status(400).json({ message: 'Valid amount chahiye' });
        }
        const s = await getOrCreateShipping();
        s.shippingFee = Number(amount);
        await s.save();
        res.json({ message: 'Shipping fee updated', shippingFee: s.shippingFee });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/settings/shipping-fee   (admin - hatane/free karne ke liye)
router.delete('/shipping-fee', authRequired, async (_req, res) => {
    try {
        const s = await getOrCreateShipping();
        s.shippingFee = 0;
        await s.save();
        res.json({ message: 'Shipping fee removed (free shipping ab)', shippingFee: 0 });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ==================== NAYA CODE YAHAN KHATAM ====================

module.exports = router;