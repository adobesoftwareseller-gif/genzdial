require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

// Breitling Premier dummy products (matches the 4 watch images shared by user).
// Image URLs use Unsplash placeholders — replace via Admin Panel after seeding
// to upload the real watch photos.
const products = [
    {
        name: 'Premier Heritage 38 Purple',
        brand: 'Breitling',
        description: 'Premier Heritage 38mm with purple sunray dial and purple alligator strap.',
        image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800',
        price: 442900, mrp: 525000, rating: 4.9, reviews: 24,
        category: 'luxury', tag: 'New', newArrival: true,
    },
    {
        name: 'Premier B01 Chronograph 42 Blue',
        brand: 'Breitling',
        description: 'Premier B01 42mm with blue dial, diamond-set bezel and steel bracelet.',
        image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800',
        price: 690100, mrp: 780000, rating: 4.9, reviews: 41,
        category: 'luxury', tag: 'New', newArrival: true,
    },
    {
        name: 'Premier Heritage 38 Mint',
        brand: 'Breitling',
        description: 'Premier Heritage 38mm with mint-green dial, diamond bezel and matching strap.',
        image: 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800',
        price: 865200, mrp: 950000, rating: 4.8, reviews: 18,
        category: 'luxury', tag: 'Limited Edition', newArrival: true,
    },
    {
        name: 'Premier B01 Chronograph 42 Black',
        brand: 'Breitling',
        description: 'Premier B01 42mm with black dial, diamond-set bezel and steel bracelet.',
        image: 'https://images.unsplash.com/photo-1606293459339-aa5d34a7b0e1?w=800',
        price: 690100, mrp: 780000, rating: 4.9, reviews: 33,
        category: 'luxury', tag: 'New', newArrival: true,
    },
];

(async () => {
    try {
        await mongoose.connect(
            process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/watchstore'
        );
        const result = await Product.insertMany(products);
        console.log(`Inserted ${result.length} Breitling products:`);
        result.forEach((p) => console.log(`  - ${p.name}  (₹${p.price.toLocaleString('en-IN')})`));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
