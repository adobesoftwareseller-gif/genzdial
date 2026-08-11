const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
    {
        title: { type: String, default: '' },
        subtitle: { type: String, default: '' },
        image: { type: String, required: true }, // URL or data URI
        link: { type: String, default: '/shop' },
        placement: { type: String, enum: ['hero', 'mid'], default: 'hero' },
        order: { type: Number, default: 0 },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);
