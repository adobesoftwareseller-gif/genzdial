const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const admin = require('../firebaseAdmin');
const { getAuth } = require('firebase-admin/auth');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'dev-secret';

const normalizePhone = (raw) => String(raw || '').replace(/\D/g, '').slice(-10);

// POST /api/auth/firebase-login  { idToken, name? }
// Client verifies the phone number via Firebase Phone Auth (OTP), then sends
// the resulting Firebase ID token here. We verify it server-side, upsert a
// User record by phone, and issue our own app JWT (same shape as before).
router.post('/firebase-login', async (req, res) => {
    try {
        const { idToken, name } = req.body;
        if (!idToken) return res.status(400).json({ message: 'idToken is required' });

        const decoded = await getAuth().verifyIdToken(idToken);
        const phone = normalizePhone(decoded.phone_number);
        if (!phone) return res.status(400).json({ message: 'Phone number not found in token' });

        let user = await User.findOne({ phone });
        if (!user) {
            user = await User.create({ phone, name: String(name || '').trim() });
        }
        user.lastLoginAt = new Date();
        await user.save();

        const token = jwt.sign({ uid: user._id.toString(), phone: user.phone }, SECRET, {
            expiresIn: '30d',
        });

        return res.json({
            ok: true,
            token,
            user: { _id: user._id, phone: user.phone, name: user.name },
        });
    } catch (err) {
        console.error('[auth] firebase-login failed:', err.message);
        return res.status(401).json({ message: 'Invalid or expired Firebase token' });
    }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
    try {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;
        if (!token) return res.status(401).json({ message: 'Unauthorized' });
        const payload = jwt.verify(token, SECRET);
        const user = await User.findById(payload.uid);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });
        return res.json({ _id: user._id, phone: user.phone, name: user.name });
    } catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;