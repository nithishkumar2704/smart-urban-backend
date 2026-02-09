const ServiceProvider = require('../models/Provider');
const Service = require('../models/Service');
const { getNearbyProviders } = require('../utils/geolocation');

// @desc    Register as service provider
// @route   POST /api/providers/register
// @access  Private
exports.registerProvider = async (req, res) => {
    try {
        const {
            businessName,
            tagline,
            description,
            category,
            experienceYears,
            hourlyRate,
            location,
            address,
            availability,
            certifications
        } = req.body;

        // Check if user already has a provider profile
        const existingProvider = await ServiceProvider.findOne({ userId: req.user._id });
        if (existingProvider) {
            return res.status(400).json({ message: 'Provider profile already exists' });
        }

        // Create provider profile
        const provider = await ServiceProvider.create({
            userId: req.user._id,
            businessName,
            tagline,
            description,
            category,
            experienceYears,
            hourlyRate,
            location,
            address,
            availability,
            certifications
        });

        res.status(201).json(provider);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all providers (with filters)
// @route   GET /api/providers
// @access  Public
exports.getProviders = async (req, res) => {
    try {
        const { category, minRating, maxPrice, verified } = req.query;

        let query = {};

        if (category) query.category = category;
        if (verified) query.verified = verified === 'true';
        if (minRating) query['rating.average'] = { $gte: parseFloat(minRating) };
        if (maxPrice) query.hourlyRate = { $lte: parseFloat(maxPrice) };

        const providers = await ServiceProvider.find(query)
            .populate('userId', 'name email profilePicture phone')
            .sort({ 'rating.average': -1 });

        res.json(providers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get nearby providers
// @route   GET /api/providers/nearby
// @access  Public
exports.getNearbyProvidersController = async (req, res) => {
    try {
        const { lat, lng, radius = 10, category } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ message: 'Latitude and longitude required' });
        }

        let providers = await getNearbyProviders(
            parseFloat(lat),
            parseFloat(lng),
            parseFloat(radius),
            ServiceProvider
        );

        // Filter by category if provided
        if (category) {
            providers = providers.filter(p => p.category === category);
        }

        res.json(providers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single provider
// @route   GET /api/providers/:id
// @access  Public
exports.getProviderById = async (req, res) => {
    try {
        const provider = await ServiceProvider.findById(req.params.id)
            .populate('userId', 'name email profilePicture phone');

        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        // Get provider's services
        const services = await Service.find({ providerId: provider._id, isActive: true });

        res.json({ ...provider.toObject(), services });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update provider profile
// @route   PUT /api/providers/profile
// @access  Private (Provider only)
exports.updateProviderProfile = async (req, res) => {
    try {
        const provider = await ServiceProvider.findOne({ userId: req.user._id });

        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }

        // Update fields
        provider.businessName = req.body.businessName || provider.businessName;
        provider.tagline = req.body.tagline || provider.tagline;
        provider.description = req.body.description || provider.description;
        provider.category = req.body.category || provider.category;
        provider.experienceYears = req.body.experienceYears || provider.experienceYears;
        provider.hourlyRate = req.body.hourlyRate || provider.hourlyRate;
        provider.location = req.body.location || provider.location;
        provider.address = req.body.address || provider.address;
        provider.availability = req.body.availability || provider.availability;
        provider.certifications = req.body.certifications || provider.certifications;
        provider.photos = req.body.photos || provider.photos;

        const updatedProvider = await provider.save();
        res.json(updatedProvider);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify provider (Admin only)
// @route   PUT /api/providers/verify/:id
// @access  Private (Admin only)
exports.verifyProvider = async (req, res) => {
    try {
        const provider = await ServiceProvider.findById(req.params.id);

        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        provider.verified = true;
        await provider.save();

        res.json({ message: 'Provider verified successfully', provider });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get provider dashboard stats
// @route   GET /api/providers/dashboard/stats
// @access  Private (Provider only)
exports.getProviderStats = async (req, res) => {
    try {
        const provider = await ServiceProvider.findOne({ userId: req.user._id });

        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }

        res.json({
            totalBookings: provider.stats.totalBookings,
            completedBookings: provider.stats.completedBookings,
            completionRate: provider.stats.completionRate,
            totalEarnings: provider.stats.totalEarnings,
            rating: provider.rating
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerProvider,
    getProviders,
    getNearbyProvidersController,
    getProviderById,
    updateProviderProfile,
    verifyProvider,
    getProviderStats
};
