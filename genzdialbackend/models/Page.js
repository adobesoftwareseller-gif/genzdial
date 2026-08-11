const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema(
    {
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
        title: { type: String, required: true },
        content: { type: String, default: '' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Page', pageSchema);
