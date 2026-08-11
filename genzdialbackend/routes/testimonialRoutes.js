const express = require('express');
const Testimonial = require('../models/Testimonial');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (_req, res) => {
    try {
        const items = await Testimonial.find({ active: true }).sort({ order: 1, createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/all', authRequired, async (_req, res) => {
    const items = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    res.json(items);
});

router.post('/', authRequired, async (req, res) => {
    try {
        const item = await Testimonial.create(req.body);
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', authRequired, async (req, res) => {
    try {
        const item = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!item) return res.status(404).json({ message: 'Not found' });
        res.json(item);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', authRequired, async (req, res) => {
    try {
        const r = await Testimonial.findByIdAndDelete(req.params.id);
        if (!r) return res.status(404).json({ message: 'Not found' });
        res.json({ ok: true });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
