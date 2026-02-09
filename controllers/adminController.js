const User = require('../models/User');
const ServiceProvider = require('../models/Provider'); // Replaced Listing with Provider/Service
const Service = require('../models/Service');
const Booking = require('../models/Booking');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalProviders = await ServiceProvider.countDocuments(); // Use ServiceProvider count
        const totalBookings = await Booking.countDocuments();
        const totalRevenue = await Booking.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

        res.json({
            totalUsers,
            totalProviders,
            totalBookings,
            totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
            recentUsers
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Service Demand Analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAdminAnalytics = async (req, res) => {
    try {
        const bookings = await Booking.find({}).populate('serviceId').populate('providerId');

        // Aggregate by Location and Category
        const locationStats = {};

        bookings.forEach(b => {
            // Access location from provider (assuming provider has location info)
            // or from booking serviceAddress.city if available.
            // Let's use booking city for demand location.
            const city = b.serviceAddress?.city || 'Unknown';

            // Access category from Service populated or Provider
            const category = b.serviceId?.category || (b.providerId?.category) || 'Other';

            if (!locationStats[city]) {
                locationStats[city] = {};
            }
            if (!locationStats[city][category]) {
                locationStats[city][category] = 0;
            }
            locationStats[city][category]++;
        });

        // Format for frontend
        const formattedStats = Object.keys(locationStats).map(city => {
            const categories = Object.keys(locationStats[city]).map(cat => ({
                category: cat,
                count: locationStats[city][cat]
            })).sort((a, b) => b.count - a.count);

            return {
                location: city,
                topServices: categories
            };
        });

        res.json(formattedStats);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Analytics calculation failed' });
    }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAdminStats,
    getAdminAnalytics,
    getAllUsers,
    deleteUser
};
