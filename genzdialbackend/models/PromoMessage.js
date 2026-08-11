const mongoose = require('mongoose');

const promoMessageSchema = new mongoose.Schema(
    {
        text: { type: String, required: true },
        order: { type: Number, default: 0 },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('PromoMessage', promoMessageSchema);
