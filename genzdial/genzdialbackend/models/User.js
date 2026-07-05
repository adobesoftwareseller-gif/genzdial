const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        phone: { type: String, required: true, unique: true, index: true, trim: true },
        name: { type: String, default: '' },
        lastLoginAt: { type: Date },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
