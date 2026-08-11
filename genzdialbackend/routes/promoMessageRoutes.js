const express = require('express');
const PromoMessage = require('../models/PromoMessage');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// Public: list active messages for top promo strip
router.get('/', async (_req, res) => {
    try {
        const items = await PromoMessage.find({ active: true }).sort({ order: 1, createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin: list all
router.get('/all', authRequired, async (_req, res) => {
    const items = await PromoMessage.find().sort({ order: 1, createdAt: -1 });
    res.json(items);
});

router.post('/', authRequired, async (req, res) => {
    try {
        const item = await PromoMessage.create(req.body);
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', authRequired, async (req, res) => {
    try {
        const item = await PromoMessage.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!item) return res.status(404).json({ message: 'Not found' });
        res.json(item);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', authRequired, async (req, res) => {
    try {
        const r = await PromoMessage.findByIdAndDelete(req.params.id);
        if (!r) return res.status(404).json({ message: 'Not found' });
        res.json({ ok: true });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
