require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
    {
        name: 'Chronos Classic Leather',
        brand: 'Chronos',
        description: 'Timeless analog watch with genuine leather strap and sapphire crystal glass.',
        image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800',
        price: 2499, mrp: 3999, rating: 4.6, reviews: 312,
        category: 'men', tag: 'Best Seller', trending: true,
    },
    {
        name: 'Aurora Rose Gold',
        brand: 'Aurora',
        description: 'Elegant rose-gold tone bracelet watch with mother-of-pearl dial.',
        image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800',
        price: 3299, mrp: 4999, rating: 4.8, reviews: 421,
        category: 'women', tag: 'Best Seller', trending: true,
    },
    {
        name: 'PulseFit Smart Active',
        brand: 'PulseFit',
        description: 'Smartwatch with AMOLED display, SpO2, heart rate, GPS and 14-day battery.',
        image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800',
        price: 1999, mrp: 4999, rating: 4.4, reviews: 1820,
        category: 'smart', tag: 'New Launch', trending: true, newArrival: true,
    },
    {
        name: 'Nimbus Sport Diver',
        brand: 'Nimbus',
        description: '50M water-resistant diver watch with luminous markers and tachymeter bezel.',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
        price: 4499, mrp: 6999, rating: 4.7, reviews: 256,
        category: 'sports', tag: 'Best Seller', trending: true,
    },
    {
        name: 'Regalia Skeleton Automatic',
        brand: 'Regalia',
        description: 'Premium automatic skeleton watch with 22-jewel movement and steel mesh strap.',
        image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800',
        price: 8999, mrp: 12999, rating: 4.9, reviews: 142,
        category: 'luxury', tag: 'Best Seller',
    },
    {
        name: 'Lumiere Minimalist',
        brand: 'Lumiere',
        description: 'Slim minimalist watch with mesh band, perfect for office and casual looks.',
        image: 'https://images.unsplash.com/photo-1495856458515-0637185db551?w=800',
        price: 1799, mrp: 2999, rating: 4.5, reviews: 198,
        category: 'unisex', tag: 'Best Seller', newArrival: true,
    },
    {
        name: 'Orion Chronograph',
        brand: 'Orion',
        description: 'Multi-function chronograph with stainless steel bracelet and date display.',
        image: 'https://images.unsplash.com/photo-1606293459339-aa5d34a7b0e1?w=800',
        price: 3799, mrp: 5499, rating: 4.6, reviews: 388,
        category: 'men', tag: 'Best Seller',
    },
    {
        name: 'Bloom Petite',
        brand: 'Bloom',
        description: 'Petite ladies watch with crystal-studded bezel and satin strap.',
        image: 'https://images.unsplash.com/photo-1639037687665-37e94e0bd6ed?w=800',
        price: 1599, mrp: 2799, rating: 4.4, reviews: 162,
        category: 'women', newArrival: true,
    },
    {
        name: 'PulseFit Lite Kids',
        brand: 'PulseFit',
        description: 'Kids smartwatch with GPS tracking, SOS calling and fun activity games.',
        image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800',
        price: 1299, mrp: 2499, rating: 4.3, reviews: 540,
        category: 'smart', tag: 'New Launch', newArrival: true,
    },
    {
        name: 'Apex Field G-Shock',
        brand: 'Apex',
        description: 'Rugged shock-resistant field watch with dual time and digital compass.',
        image: 'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=800',
        price: 2899, mrp: 4499, rating: 4.7, reviews: 612,
        category: 'sports', tag: 'Best Seller',
    },
    {
        name: 'Velvet Noir',
        brand: 'Velvet',
        description: 'All-black stealth watch with brushed steel case and silicone strap.',
        image: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800',
        price: 2199, mrp: 3499, rating: 4.5, reviews: 274,
        category: 'unisex', newArrival: true,
    },
    {
        name: 'Heritage Gold Royale',
        brand: 'Heritage',
        description: 'Gold-plated luxury dress watch with Roman numerals and croco-leather strap.',
        image: 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800',
        price: 11999, mrp: 16999, rating: 4.9, reviews: 88,
        category: 'luxury', tag: 'Best Seller',
    },
];

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/watchstore');
        await Product.deleteMany({});
        await Product.insertMany(products);
        console.log(`Seeded ${products.length} products`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
