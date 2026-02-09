const mongoose = require('mongoose');

const listingSchema = mongoose.Schema({
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String, // e.g., 'Plumbing', 'Electrical'
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    inspectionPrice: {
        type: Number,
        default: 200 // Default inspection fee if not provided
    },
    image: {
        type: String,
        required: false
    },
    location: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Listing', listingSchema);
