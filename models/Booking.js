const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
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
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    bookingDate: {
        type: Date,
        required: true
    },
    bookingTime: {
        type: String,
        required: true
    },
    serviceAddress: {
        street: { type: String, required: true },
        city: String,
        state: String,
        zipCode: String,
        additionalInfo: String
    },
    contactPhone: {
        type: String,
        required: true
    },
    additionalNotes: {
        type: String,
        default: ''
    },
    totalAmount: {
        type: Number,
        required: true
    },
    serviceFee: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Declined'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Refunded'],
        default: 'Pending'
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'Online'],
        default: 'Cash'
    },
    cancellationReason: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index for faster queries
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ providerId: 1, status: 1 });
bookingSchema.index({ bookingDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
