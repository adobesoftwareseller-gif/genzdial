const express = require('express');
const Product = require('../models/Product');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// GET /api/products  (supports ?category=&trending=&newArrival=&q=)
router.get('/', async (req, res) => {
    try {
        const { category, trending, newArrival, q, limit } = req.query;
        const filter = {};
        if (category) filter.category = category;
        if (trending === 'true') filter.trending = true;
        if (newArrival === 'true') filter.newArrival = true;
        if (q) filter.name = { $regex: q, $options: 'i' };

        // List view: exclude the heavy gallery/variant fields (which may hold
        // large base64 data URIs) — the product cards only need the primary
        // `image`. The detail endpoint (/:id) still returns the full document.
        // .lean() skips Mongoose hydration for a faster, smaller response.
        let query = Product.find(filter)
            .select('-images -colorVariants')
            .sort({ createdAt: -1 })
            .lean();

        const lim = parseInt(limit, 10);
        if (Number.isFinite(lim) && lim > 0) query = query.limit(lim);

        const products = await query;
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/products  (admin)
router.post('/', authRequired, async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT /api/products/:id  (admin)
router.put('/:id', authRequired, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ message: 'Not found' });
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/products/:id  (admin)
router.delete('/:id', authRequired, async (req, res) => {
    try {
        const r = await Product.findByIdAndDelete(req.params.id);
        if (!r) return res.status(404).json({ message: 'Not found' });
        res.json({ ok: true });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
