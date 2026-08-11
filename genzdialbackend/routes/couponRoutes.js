const express = require('express');
const Coupon = require('../models/Coupon');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// Compute discount amount for a coupon given a subtotal.
// Returns { discount, percent, code } or throws an Error with .status set.
async function resolveCoupon(rawCode, subtotal) {
    const code = String(rawCode || '').trim().toUpperCase();
    if (!code) {
        const e = new Error('Coupon code is required'); e.status = 400; throw e;
    }
    const coupon = await Coupon.findOne({ code });
    if (!coupon || !coupon.active) {
        const e = new Error('Invalid coupon code'); e.status = 404; throw e;
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
        const e = new Error('Coupon has expired'); e.status = 410; throw e;
    }
    const sub = Number(subtotal) || 0;
    if (coupon.minSubtotal && sub < coupon.minSubtotal) {
        const e = new Error(`Minimum order ₹${coupon.minSubtotal} required for this coupon`);
        e.status = 400; throw e;
    }
    let discount = Math.round((sub * coupon.percent) / 100);
    if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
    return { code: coupon.code, percent: coupon.percent, discount, description: coupon.description };
}

// POST /api/coupons/validate  { code, subtotal }  (public)
router.post('/validate', async (req, res) => {
    try {
        const result = await resolveCoupon(req.body.code, req.body.subtotal);
        res.json({ ok: true, ...result });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
});

// GET /api/coupons   (admin)
router.get('/', authRequired, async (_req, res) => {
    const items = await Coupon.find().sort({ createdAt: -1 });
    res.json(items);
});

// POST /api/coupons   (admin)
router.post('/', authRequired, async (req, res) => {
    try {
        const item = await Coupon.create({
            ...req.body,
            code: String(req.body.code || '').trim().toUpperCase(),
        });
        res.status(201).json(item);
    } catch (err) {
        const msg = err.code === 11000 ? 'Coupon code already exists' : err.message;
        res.status(400).json({ message: msg });
    }
});

// PUT /api/coupons/:id   (admin)
router.put('/:id', authRequired, async (req, res) => {
    try {
        const payload = { ...req.body };
        if (payload.code) payload.code = String(payload.code).trim().toUpperCase();
        const item = await Coupon.findByIdAndUpdate(req.params.id, payload, { new: true });
        if (!item) return res.status(404).json({ message: 'Not found' });
        res.json(item);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/coupons/:id   (admin)
router.delete('/:id', authRequired, async (req, res) => {
    try {
        const r = await Coupon.findByIdAndDelete(req.params.id);
        if (!r) return res.status(404).json({ message: 'Not found' });
        res.json({ ok: true });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
module.exports.resolveCoupon = resolveCoupon;
