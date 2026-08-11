const mongoose = require('mongoose');

const mediaLogoSchema = new mongoose.Schema(
    {
        name: { type: String, default: '' },
        image: { type: String, required: true }, // URL or data URI
        link: { type: String, default: '' },
        order: { type: Number, default: 0 },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('MediaLogo', mediaLogoSchema);
