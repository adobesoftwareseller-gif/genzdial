const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const EMAIL = 'admin@genzdial.com';
const PASSWORD = 'admin123';

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const hash = await bcrypt.hash(PASSWORD, 10);
        const admin = await Admin.findOneAndUpdate(
            { email: EMAIL },
            { email: EMAIL, password: hash, name: 'Admin' },
            { upsert: true, new: true }
        );

        console.log('Admin password reset for:', admin.email);
        console.log('New password:', PASSWORD);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
})();