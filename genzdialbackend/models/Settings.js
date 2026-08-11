const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true, index: true },
    paymentQr: { type: String, default: '' }, // /uploads/qr/xxx.png
    upiId: { type: String, default: '' },
    payeeName: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
