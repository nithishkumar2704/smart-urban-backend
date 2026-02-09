const mongoose = require('mongoose');

const serviceProviderSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    businessName: {
        type: String,
        required: true
    },
    tagline: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        required: true,
        enum: ['Plumber', 'Electrician', 'Painter', 'Cleaner', 'Mechanic', 'Salon', 'Carpenter', 'Gardener', 'AC Repair', 'Appliance Repair', 'Pest Control', 'Moving']
    },
    experienceYears: {
        type: Number,
        default: 0
    },
    hourlyRate: {
        type: Number,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    availability: {
        monday: { available: { type: Boolean, default: true }, hours: { type: String, default: '9:00 AM - 6:00 PM' } },
        tuesday: { available: { type: Boolean, default: true }, hours: { type: String, default: '9:00 AM - 6:00 PM' } },
        wednesday: { available: { type: Boolean, default: true }, hours: { type: String, default: '9:00 AM - 6:00 PM' } },
        thursday: { available: { type: Boolean, default: true }, hours: { type: String, default: '9:00 AM - 6:00 PM' } },
        friday: { available: { type: Boolean, default: true }, hours: { type: String, default: '9:00 AM - 6:00 PM' } },
        saturday: { available: { type: Boolean, default: false }, hours: { type: String, default: 'Closed' } },
        sunday: { available: { type: Boolean, default: false }, hours: { type: String, default: 'Closed' } }
    },
    certifications: [{
        name: String,
        issuer: String,
        year: Number
    }],
    photos: [{
        url: String,
        caption: String,
        isFeatured: { type: Boolean, default: false }
    }],
    verified: {
        type: Boolean,
        default: false
    },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    stats: {
        totalBookings: { type: Number, default: 0 },
        completedBookings: { type: Number, default: 0 },
        completionRate: { type: Number, default: 0 },
        totalEarnings: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

// Create geospatial index for location-based queries
serviceProviderSchema.index({ location: '2dsphere' });

// Method to calculate completion rate
serviceProviderSchema.methods.updateCompletionRate = function () {
    if (this.stats.totalBookings > 0) {
        this.stats.completionRate = Math.round((this.stats.completedBookings / this.stats.totalBookings) * 100);
    }
};

module.exports = mongoose.model('ServiceProvider', serviceProviderSchema);