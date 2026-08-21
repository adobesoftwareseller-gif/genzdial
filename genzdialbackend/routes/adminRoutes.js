const express = require('express');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const { signToken, authRequired } = require('../middleware/auth');

const router = express.Router();

// POST /api/admin/login  { email, password }
router.post('/login', async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: 'Login failed' });
        }

        const match = await bcrypt.compare(password, admin.password);
        if (!match) {
            return res.status(401).json({ message: 'Login failed' });
        }

        const token = signToken({ adminId: admin._id.toString(), email: admin.email });

        return res.json({
            token,
            admin: { _id: admin._id, email: admin.email, name: admin.name },
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// GET /api/admin/me   (verify current admin session)
router.get('/me', authRequired, async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.adminId).select('-password');
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        res.json(admin);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;