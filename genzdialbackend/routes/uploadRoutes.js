const express = require('express');
const multer = require('multer');
const { authRequired } = require('../middleware/auth');
const { isConfigured: cloudinaryOn, uploadBuffer } = require('../config/cloudinary');

const router = express.Router();

// Keep the file in memory and stream it straight to Cloudinary — nothing is
// ever written to disk (works on read-only serverless filesystems too).
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_req, file, cb) => {
        if (/^image\//.test(file.mimetype)) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    },
});

// POST /api/uploads/image  (admin) -> { url }
// Used by every admin form (products, banners, media logos, color variants)
// so images live on Cloudinary as short URLs instead of base64 in MongoDB.
router.post('/image', authRequired, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file' });
        if (!cloudinaryOn) {
            return res.status(500).json({
                error: 'Image uploads require Cloudinary to be configured (set CLOUDINARY_* env vars).',
            });
        }
        const result = await uploadBuffer(req.file.buffer, {
            folder: 'genzdial/images',
            resourceType: 'image',
        });
        res.json({ url: result.secure_url });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

module.exports = router;
