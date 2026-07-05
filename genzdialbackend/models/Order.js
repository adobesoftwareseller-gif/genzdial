const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        brand: String,
        image: String,
        price: Number,
        qty: Number,
    },
    { _id: false }
);

const addressSchema = new mongoose.Schema(
    {
        fullName: String,
        phone: String,
        line1: String,
        line2: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: 'India' },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
        userName: String,
        userPhone: String,
        items: [orderItemSchema],
        address: addressSchema,
        subtotal: Number,
        shipping: Number,
        discount: { type: Number, default: 0 },
        couponCode: { type: String, default: '' },
        couponPercent: { type: Number, default: 0 },
        total: Number,
        
        // --- ADDED FIELDS FOR RAZORPAY INTEGRATION ---
        razorpayOrderId: { type: String, required: true },
        razorpayPaymentId: { type: String, required: true },
        paymentStatus: { type: String, default: 'paid' },
        // ---------------------------------------------
        
        paymentRef: String, 
        status: {
            type: String,
            enum: ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'],
            default: 'confirmed', // Updated default to 'confirmed' because we only save after verification
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);