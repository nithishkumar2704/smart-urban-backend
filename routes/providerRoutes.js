const express = require('express');
const router = express.Router();
const {
    registerProvider,
    getProviders,
    getNearbyProvidersController,
    getProviderById,
    updateProviderProfile,
    verifyProvider,
    getProviderStats
} = require('../controllers/providerController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');

// Public routes
router.get('/', getProviders);
router.get('/nearby', getNearbyProvidersController);
router.get('/:id', getProviderById);

// Protected routes (Provider)
router.post('/register', protect, registerProvider);
router.put('/profile', protect, updateProviderProfile);
router.get('/dashboard/stats', protect, getProviderStats);

// Admin routes
router.put('/verify/:id', protect, admin, verifyProvider);

module.exports = router;
