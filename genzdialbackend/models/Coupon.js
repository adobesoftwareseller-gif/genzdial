const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
        percent: { type: Number, required: true, min: 1, max: 100 },
        active: { type: Boolean, default: true },
        minSubtotal: { type: Number, default: 0 },
        maxDiscount: { type: Number, default: 0 }, // 0 = no cap
        expiresAt: { type: Date, default: null },
        description: { type: String, default: '' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
