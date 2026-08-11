const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        date: { type: String, default: '' },
        rating: { type: Number, default: 10, min: 0, max: 10 },
        text: { type: String, required: true },
        order: { type: Number, default: 0 },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
