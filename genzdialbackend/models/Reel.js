const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema(
    {
        video: { type: String, required: true }, // /uploads/reels/xxx.mp4
        poster: { type: String, default: '' },   // optional thumbnail (data URI or URL)
        link: { type: String, default: '/shop' },
        label: { type: String, default: 'Shop Now' },
        order: { type: Number, default: 0 },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Reel', reelSchema);
