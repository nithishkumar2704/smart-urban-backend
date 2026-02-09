const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceProvider',
        required: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    helpfulCount: {
        type: Number,
        default: 0
    },
    helpfulBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    verifiedPurchase: {
        type: Boolean,
        default: true
    },
    providerResponse: {
        comment: String,
        respondedAt: Date
    }
}, {
    timestamps: true
});

// Index for faster queries
reviewSchema.index({ providerId: 1, rating: -1 });
reviewSchema.index({ userId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
