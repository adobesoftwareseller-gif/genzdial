const express = require('express');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const { signToken, authRequired } = require('../middleware/auth');

const router = express.Router();

// POST /api/admin/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

        const ok = await bcrypt.compare(password, admin.password);
        if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

        const token = signToken({ id: admin._id, email: admin.email, name: admin.name });
        res.json({ token, admin: { id: admin._id, email: admin.email, name: admin.name } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/admin/me
router.get('/me', authRequired, (req, res) => res.json({ admin: req.admin }));

module.exports = router;
