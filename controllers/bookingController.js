const Booking = require('../models/Booking');
const ServiceProvider = require('../models/Provider');
const Service = require('../models/Service');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
    try {
        const {
            providerId,
            serviceId,
            bookingDate,
            bookingTime,
            serviceAddress,
            contactPhone,
            additionalNotes,
            totalAmount,
            serviceFee
        } = req.body;

        const booking = await Booking.create({
            userId: req.user._id,
            providerId,
            serviceId,
            bookingDate,
            bookingTime,
            serviceAddress,
            contactPhone,
            additionalNotes,
            totalAmount,
            serviceFee
        });

        // Update provider stats
        const provider = await ServiceProvider.findById(providerId);
        if (provider) {
            provider.stats.totalBookings += 1;
            await provider.save();
        }

        const populatedBooking = await Booking.findById(booking._id)
            .populate('userId', 'name email phone')
            .populate({
                path: 'providerId',
                populate: { path: 'userId', select: 'name email phone' }
            })
            .populate('serviceId', 'name description pricePerHour');

        res.status(201).json(populatedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's bookings
// @route   GET /api/bookings
// @access  Private
exports.getUserBookings = async (req, res) => {
    try {
        const { status } = req.query;

        let query = { userId: req.user._id };
        if (status) query.status = status;

        const bookings = await Booking.find(query)
            .populate({
                path: 'providerId',
                populate: { path: 'userId', select: 'name profilePicture' }
            })
            .populate('serviceId', 'name description pricePerHour')
            .sort({ bookingDate: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get provider's bookings
// @route   GET /api/bookings/provider
// @access  Private (Provider only)
exports.getProviderBookings = async (req, res) => {
    try {
        const provider = await ServiceProvider.findOne({ userId: req.user._id });

        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }

        const { status } = req.query;
        let query = { providerId: provider._id };
        if (status) query.status = status;

        const bookings = await Booking.find(query)
            .populate('userId', 'name email phone profilePicture')
            .populate('serviceId', 'name description pricePerHour')
            .sort({ bookingDate: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('userId', 'name email phone profilePicture')
            .populate({
                path: 'providerId',
                populate: { path: 'userId', select: 'name email phone profilePicture' }
            })
            .populate('serviceId', 'name description pricePerHour estimatedDuration');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user is authorized to view this booking
        if (booking.userId._id.toString() !== req.user._id.toString() &&
            booking.providerId.userId._id.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this booking' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private (Provider or User)
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status, cancellationReason } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Get provider
        const provider = await ServiceProvider.findById(booking.providerId);

        // Check authorization
        const isProvider = provider && provider.userId.toString() === req.user._id.toString();
        const isCustomer = booking.userId.toString() === req.user._id.toString();

        if (!isProvider && !isCustomer && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this booking' });
        }

        // Update status
        booking.status = status;
        if (cancellationReason) {
            booking.cancellationReason = cancellationReason;
        }

        // Update provider stats if completed
        if (status === 'Completed' && provider) {
            provider.stats.completedBookings += 1;
            provider.stats.totalEarnings += booking.totalAmount;
            provider.updateCompletionRate();
            await provider.save();
        }

        await booking.save();

        const updatedBooking = await Booking.findById(booking._id)
            .populate('userId', 'name email phone')
            .populate({
                path: 'providerId',
                populate: { path: 'userId', select: 'name email phone' }
            })
            .populate('serviceId', 'name description');

        res.json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only customer can update booking details
        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this booking' });
        }

        // Only allow updates if booking is still pending
        if (booking.status !== 'Pending') {
            return res.status(400).json({ message: 'Cannot update confirmed or completed bookings' });
        }

        booking.bookingDate = req.body.bookingDate || booking.bookingDate;
        booking.bookingTime = req.body.bookingTime || booking.bookingTime;
        booking.serviceAddress = req.body.serviceAddress || booking.serviceAddress;
        booking.contactPhone = req.body.contactPhone || booking.contactPhone;
        booking.additionalNotes = req.body.additionalNotes || booking.additionalNotes;

        const updatedBooking = await booking.save();
        res.json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check authorization
        if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        booking.status = 'Cancelled';
        booking.cancellationReason = req.body.cancellationReason || 'Cancelled by user';
        await booking.save();

        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBooking,
    getUserBookings,
    getProviderBookings,
    getBookingById,
    updateBookingStatus,
    updateBooking,
    cancelBooking
};
