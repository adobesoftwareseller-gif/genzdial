const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Settings = require('../models/Settings');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads', 'qr');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
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
        const url = `/uploads/qr/${req.file.filename}`;
        const s = await getOrCreate();
        // best-effort delete previous file
        if (s.paymentQr && s.paymentQr.startsWith('/uploads/qr/')) {
            const prev = path.join(__dirname, '..', s.paymentQr);
            fs.promises.unlink(prev).catch(() => { });
        }
        s.paymentQr = url;
        await s.save();
        res.json({ url });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
