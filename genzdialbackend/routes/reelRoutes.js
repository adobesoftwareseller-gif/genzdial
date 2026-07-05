const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Reel = require('../models/Reel');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

const MAX_REELS = 10;

const uploadDir = path.join(__dirname, '..', 'uploads', 'reels');
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
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (_req, file, cb) => {
        if (/^video\//.test(file.mimetype)) cb(null, true);
        else cb(new Error('Only video files are allowed'));
    },
});

router.get('/', async (_req, res) => {
    const reels = await Reel.find({ active: true }).sort({ order: 1, createdAt: -1 });
    res.json(reels);
});

router.get('/all', authRequired, async (_req, res) => {
    const reels = await Reel.find().sort({ order: 1, createdAt: -1 });
    res.json(reels);
});

router.post('/upload', authRequired, upload.single('video'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    res.json({ url: `/uploads/reels/${req.file.filename}` });
}); router.post('/', authRequired, async (req, res) => {
    try {
        const count = await Reel.countDocuments();
        if (count >= MAX_REELS) {
            return res.status(400).json({ error: `You can have at most ${MAX_REELS} reels. Delete one before adding a new one.` });
        }
        const reel = await Reel.create(req.body);
        res.status(201).json(reel);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.put('/:id', authRequired, async (req, res) => {
    try {
        const reel = await Reel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!reel) return res.status(404).json({ error: 'Not found' });
        res.json(reel);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.delete('/:id', authRequired, async (req, res) => {
    const reel = await Reel.findByIdAndDelete(req.params.id);
    if (!reel) return res.status(404).json({ error: 'Not found' });
    if (reel.video && reel.video.startsWith('/uploads/reels/')) {
// const fp = path.join(__dirname, '..', reel.video);
// fs.promises.unlink(fp).catch(() => { });
    }
    res.json({ ok: true });
});

module.exports = router;
