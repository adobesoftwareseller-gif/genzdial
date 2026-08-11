const express = require('express');
const Page = require('../models/Page');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

const ALLOWED_SLUGS = ['privacy-policy', 'terms-and-conditions'];

router.get('/all', authRequired, async (_req, res) => {
    try {
        const items = await Page.find().sort({ slug: 1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/:slug', async (req, res) => {
    try {
        const slug = String(req.params.slug || '').toLowerCase();
        const page = await Page.findOne({ slug });
        if (!page) return res.status(404).json({ message: 'Not found' });
        res.json(page);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:slug', authRequired, async (req, res) => {
    try {
        const slug = String(req.params.slug || '').toLowerCase();
        if (!ALLOWED_SLUGS.includes(slug)) {
            return res.status(400).json({ message: 'Invalid page slug' });
        }
        const { title, content } = req.body || {};
        const update = {};
        if (typeof title === 'string') update.title = title;
        if (typeof content === 'string') update.content = content;
        const page = await Page.findOneAndUpdate(
            { slug },
            { $set: update, $setOnInsert: { slug } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.json(page);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
