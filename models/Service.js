const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema({
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceProvider',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    pricePerHour: {
        type: Number,
        required: true
    },
    estimatedDuration: {
        type: String, // e.g., "2-3 hours"
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
serviceSchema.index({ providerId: 1, isActive: 1 });
serviceSchema.index({ category: 1 });

module.exports = mongoose.model('Service', serviceSchema);
