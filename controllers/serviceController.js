const Service = require('../models/Service');
const ServiceProvider = require('../models/Provider');

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Provider only)
exports.createService = async (req, res) => {
    try {
        // Get provider profile
        const provider = await ServiceProvider.findOne({ userId: req.user._id });

        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }

        const { name, description, category, pricePerHour, estimatedDuration } = req.body;

        const service = await Service.create({
            providerId: provider._id,
            name,
            description,
            category,
            pricePerHour,
            estimatedDuration
        });

        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res) => {
    try {
        const { category, providerId } = req.query;

        let query = { isActive: true };

        if (category) query.category = category;
        if (providerId) query.providerId = providerId;

        const services = await Service.find(query)
            .populate({
                path: 'providerId',
                select: 'businessName category rating hourlyRate',
                populate: {
                    path: 'userId',
                    select: 'name profilePicture'
                }
            });

        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate({
                path: 'providerId',
                populate: {
                    path: 'userId',
                    select: 'name email profilePicture phone'
                }
            });

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Provider only)
exports.updateService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Check if user owns this service
        const provider = await ServiceProvider.findOne({ userId: req.user._id });
        if (!provider || service.providerId.toString() !== provider._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this service' });
        }

        service.name = req.body.name || service.name;
        service.description = req.body.description || service.description;
        service.category = req.body.category || service.category;
        service.pricePerHour = req.body.pricePerHour || service.pricePerHour;
        service.estimatedDuration = req.body.estimatedDuration || service.estimatedDuration;
        service.isActive = req.body.isActive !== undefined ? req.body.isActive : service.isActive;

        const updatedService = await service.save();
        res.json(updatedService);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Provider only)
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Check if user owns this service
        const provider = await ServiceProvider.findOne({ userId: req.user._id });
        if (!provider || service.providerId.toString() !== provider._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this service' });
        }

        // Soft delete - just mark as inactive
        service.isActive = false;
        await service.save();

        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


