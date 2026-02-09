const Review = require('../models/Review');
const Booking = require('../models/Booking');
const ServiceProvider = require('../models/Provider');

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
    try {
        const { bookingId, rating, comment } = req.body;

        const booking = await Booking.findById(bookingId).populate('serviceId');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify user owns the booking
        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to review this booking' });
        }

        // Verify booking is completed
        if (booking.status !== 'Completed') {
            return res.status(400).json({ message: 'Can only review completed bookings' });
        }

        // Check if review already exists
        const reviewExists = await Review.findOne({ bookingId });
        if (reviewExists) {
            return res.status(400).json({ message: 'Review already submitted for this booking' });
        }

        const review = await Review.create({
            bookingId,
            userId: req.user._id,
            providerId: booking.providerId,
            serviceName: booking.serviceId ? booking.serviceId.name : 'Unknown Service',
            rating,
            comment,
            verifiedPurchase: true
        });

        // Update Provider Rating
        const provider = await ServiceProvider.findById(booking.providerId);
        if (provider) {
            const reviews = await Review.find({ providerId: booking.providerId });
            provider.rating.count = reviews.length;
            provider.rating.average = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
            provider.rating.average = Math.round(provider.rating.average * 10) / 10; // Round to 1 decimal
            await provider.save();
        }

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reviews for a provider
// @route   GET /api/reviews/:providerId
// @access  Public
const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ providerId: req.params.providerId })
            .populate('userId', 'name profilePicture')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createReview,
    getReviews
};
