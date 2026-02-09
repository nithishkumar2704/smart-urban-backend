const express = require('express');
const router = express.Router();
const {
    createBooking,
    getUserBookings,
    getProviderBookings,
    getBookingById,
    updateBookingStatus,
    updateBooking,
    cancelBooking
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.post('/', protect, createBooking);
router.get('/', protect, getUserBookings);
router.get('/provider', protect, getProviderBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/status', protect, updateBookingStatus);
router.put('/:id', protect, updateBooking);
router.delete('/:id', protect, cancelBooking);

module.exports = router;
