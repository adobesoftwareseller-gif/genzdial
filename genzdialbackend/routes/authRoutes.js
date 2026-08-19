const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'dev-secret';
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

// In-memory OTP store: { phone -> { otp, expiresAt, attempts } }
const otpStore = new Map();

const normalizePhone = (raw) => String(raw || '').replace(/\D/g, '').slice(-10);
const isValidPhone = (p) => /^[6-9]\d{9}$/.test(p);
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// apitxt.com OTP SMS delivery.
// We generate the OTP ourselves (so we can verify it locally without a
// second call to apitxt) and just ask apitxt to deliver that exact code.
async function sendViaApitxt(phone, otp) {
    const authkey = process.env.APITXT_AUTH_KEY;
    if (!authkey) throw new Error('APITXT_AUTH_KEY is not set');

    const params = new URLSearchParams({
        authkey,
        mobile: `91${phone}`,
        otp,
    });
    if (process.env.APITXT_SENDER_ID) params.set('sender', process.env.APITXT_SENDER_ID);
    if (process.env.APITXT_PE_ID) params.set('pe_id', process.env.APITXT_PE_ID);
    if (process.env.APITXT_TEMPLATE_ID) params.set('template_id', process.env.APITXT_TEMPLATE_ID);

    const resp = await fetch(`https://apitxt.com/api/sendOTP?${params.toString()}`);
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || (data.status && data.status !== 'success')) {
        throw new Error(data.message || `apitxt failed (${resp.status})`);
    }
    return { provider: 'apitxt', id: data.data?.request_id };
}

const sendOtpSms = async (phone, otp) => {
    try {
        return await sendViaApitxt(phone, otp);
    } catch (err) {
        console.error('[auth] apitxt send failed:', err.message);
        throw err;
    }
};

// POST /api/auth/send-otp  { phone, mode? }
router.post('/send-otp', async (req, res) => {
    try {
        const phone = normalizePhone(req.body.phone);
        const mode = req.body.mode === 'signup' ? 'signup' : 'login';
        if (!isValidPhone(phone)) {
            return res.status(400).json({ message: 'Valid 10-digit mobile number is required' });
        }

        const existing = await User.findOne({ phone });
        if (mode === 'login' && !existing) {
            return res.status(404).json({ message: 'No account found for this number. Please sign up first.' });
        }
        if (mode === 'signup' && existing) {
            return res.status(409).json({ message: 'Account already exists for this number. Please login.' });
        }

        const otp = generateOtp();
        otpStore.set(phone, { otp, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 });

        try {
            await sendOtpSms(phone, otp);
            return res.json({ ok: true, message: 'OTP sent to your mobile number' });
        } catch (err) {
            otpStore.delete(phone);
            return res.status(502).json({ message: 'Failed to send OTP' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// POST /api/auth/verify-otp  { phone, otp, name?, mode? }
router.post('/verify-otp', async (req, res) => {
    try {
        const phone = normalizePhone(req.body.phone);
        const otp = String(req.body.otp || '').trim();
        const mode = req.body.mode === 'signup' ? 'signup' : 'login';
        if (!isValidPhone(phone) || !otp) {
            return res.status(400).json({ message: 'Mobile number and OTP are required' });
        }

        if (mode === 'signup') {
            const trimmedName = String(req.body.name || '').trim();
            if (trimmedName.length < 2) return res.status(400).json({ message: 'Name is required' });
        }

        const record = otpStore.get(phone);
        if (!record) return res.status(400).json({ message: 'OTP not requested or expired' });
        if (Date.now() > record.expiresAt) {
            otpStore.delete(phone);
            return res.status(400).json({ message: 'OTP expired' });
        }
        if (record.attempts >= 5) {
            otpStore.delete(phone);
            return res.status(429).json({ message: 'Too many attempts, request a new OTP' });
        }
        if (record.otp !== otp) {
            record.attempts += 1;
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        otpStore.delete(phone);

        let user = await User.findOne({ phone });
        if (mode === 'signup') {
            if (user) return res.status(409).json({ message: 'Account already exists. Please login.' });
            user = await User.create({
                phone,
                name: String(req.body.name || '').trim(),
            });
        } else {
            if (!user) return res.status(404).json({ message: 'No account found. Please sign up first.' });
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
        return res.status(500).json({ message: err.message });
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
