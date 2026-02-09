const express = require('express');
const router = express.Router();
const { createListing, getListings, getMyListings, deleteListing, getListingById } = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');
const { provider } = require('../middleware/roleMiddleware');

router.route('/')
    .get(getListings)
    .post(protect, provider, createListing);

router.route('/my').get(protect, provider, getMyListings);

router.route('/:id')
    .get(getListingById)
    .delete(protect, provider, deleteListing);

module.exports = router;
