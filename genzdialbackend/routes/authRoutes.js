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

// SMS provider integration. Selected via env var SMS_PROVIDER.
// Supported: 'fast2sms' (India), 'msg91' (India), 'twilio' (global).
// If unset/unknown the OTP is just logged to server console and returned as
// `devOtp` so dev flows still work end-to-end.

async function sendViaFast2Sms(phone, otp) {
    const apiKey = process.env.FAST2SMS_API_KEY;
    if (!apiKey) throw new Error('FAST2SMS_API_KEY is not set');
    // Fast2SMS OTP route — uses preconfigured template, only need variables_values
    const url = 'https://www.fast2sms.com/dev/bulkV2';
    const params = new URLSearchParams({
        authorization: apiKey,
        route: process.env.FAST2SMS_ROUTE || 'otp',
        variables_values: otp,
        numbers: phone,
    });
    const resp = await fetch(`${url}?${params.toString()}`, { method: 'GET' });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || data.return === false) {
        throw new Error(data.message || `Fast2SMS failed (${resp.status})`);
    }
    return { provider: 'fast2sms', id: data.request_id };
}

async function sendViaMsg91(phone, otp) {
    const apiKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;
    if (!apiKey || !templateId) throw new Error('MSG91_AUTH_KEY/MSG91_TEMPLATE_ID not set');
    const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=91${phone}&otp=${otp}`;
    const resp = await fetch(url, {
        method: 'POST',
        headers: { authkey: apiKey, 'Content-Type': 'application/json' },
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || data.type === 'error') {
        throw new Error(data.message || `MSG91 failed (${resp.status})`);
    }
    return { provider: 'msg91', id: data.request_id };
}

async function sendViaTwilio(phone, otp) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM;
    if (!sid || !token || !from) throw new Error('TWILIO_* env vars not set');
    const body = new URLSearchParams({
        To: `+91${phone}`,
        From: from,
        Body: `Your Genzdial verification code is ${otp}. It expires in 5 minutes.`,
    });
    const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST',
        headers: {
            Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data.message || `Twilio failed (${resp.status})`);
    return { provider: 'twilio', id: data.sid };
}

const sendOtpSms = async (phone, otp) => {
    const provider = (process.env.SMS_PROVIDER || '').toLowerCase();
    try {
        if (provider === 'fast2sms') return await sendViaFast2Sms(phone, otp);
        if (provider === 'msg91') return await sendViaMsg91(phone, otp);
        if (provider === 'twilio') return await sendViaTwilio(phone, otp);
    } catch (err) {
        console.error(`[auth] ${provider} send failed:`, err.message);
        throw err;
    }
    console.log(`[auth] OTP for +91${phone}: ${otp}`);
    return { simulated: true };
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
            const result = await sendOtpSms(phone, otp);
            return res.json({
                ok: true,
                message: 'OTP sent to your mobile number',
                ...(result.simulated ? { devOtp: otp } : {}),
            });
        } catch (err) {
            console.error('[auth] failed to send OTP sms:', err.message);
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
