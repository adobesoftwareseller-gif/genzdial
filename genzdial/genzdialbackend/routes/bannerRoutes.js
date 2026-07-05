const express = require('express');
const Banner = require('../models/Banner');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// Public: list active banners (used by storefront), optional ?placement=hero|mid
router.get('/', async (req, res) => {
    try {
        const filter = { active: true };
        if (req.query.placement) filter.placement = req.query.placement;
        const banners = await Banner.find(filter).sort({ order: 1, createdAt: 1 });
        res.json(banners);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin: list all (active + inactive)
router.get('/all', authRequired, async (_req, res) => {
    const banners = await Banner.find().sort({ order: 1, createdAt: 1 });
    res.json(banners);
});

router.post('/', authRequired, async (req, res) => {
    try {
        const banner = await Banner.create(req.body);
        res.status(201).json(banner);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', authRequired, async (req, res) => {
    try {
        const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!banner) return res.status(404).json({ message: 'Not found' });
        res.json(banner);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', authRequired, async (req, res) => {
    try {
        const r = await Banner.findByIdAndDelete(req.params.id);
        if (!r) return res.status(404).json({ message: 'Not found' });
        res.json({ ok: true });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
