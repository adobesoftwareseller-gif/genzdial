const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        brand: { type: String, default: 'Chronos' },
        description: { type: String, default: '' },
        image: { type: String, required: true },
        images: { type: [String], default: [] },
        highlights: { type: [String], default: [] },
        price: { type: Number, required: true },
        mrp: { type: Number, required: true },
        rating: { type: Number, default: 4.5 },
        reviews: { type: Number, default: 0 },
        category: {
            type: String,
            enum: ['men', 'women', 'smart', 'luxury', 'sports', 'unisex'],
            default: 'unisex',
        },
        tag: { type: String, default: '' }, // e.g. "Best Seller", "New Launch"
        stock: { type: Number, default: 25 },
        trending: { type: Boolean, default: false },
        newArrival: { type: Boolean, default: false },
        colorVariants: [
            {
                name: { type: String, required: true }, // e.g. "Yellow"
                colorCode: { type: String, default: '' }, // e.g. "#FFD600"
                image: { type: String, required: true }, // image url or path
            }
        ],
    },
    { timestamps: true }
);

productSchema.virtual('discount').get(function () {
    if (!this.mrp || this.mrp <= this.price) return 0;
    return Math.round(((this.mrp - this.price) / this.mrp) * 100);
});

productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
