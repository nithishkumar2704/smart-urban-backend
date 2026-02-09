const Listing = require('../models/Listing');

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private (Provider)
const createListing = async (req, res) => {
    const { title, description, category, price, inspectionPrice, location, image } = req.body;

    if (!title || !description || !category || !price || !location) {
        return res.status(400).json({ message: 'Please fill all fields' });
    }

    const listing = await Listing.create({
        providerId: req.user._id,
        title,
        description,
        category,
        price,
        inspectionPrice: inspectionPrice || 200,
        image,
        location
    });

    res.status(201).json(listing);
};

// @desc    Get all listings (Public)
// @route   GET /api/listings
// @access  Public
const getListings = async (req, res) => {
    const listings = await Listing.find({}).populate('providerId', 'name email');
    res.json(listings);
};

// @desc    Get logged-in provider's listings
// @route   GET /api/listings/my
// @access  Private (Provider)
const getMyListings = async (req, res) => {
    const listings = await Listing.find({ providerId: req.user._id });
    res.json(listings);
};

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private (Provider)
const deleteListing = async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
    }

    // specific check: listing must belong to user
    if (listing.providerId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'User not authorized' });
    }

    await listing.deleteOne();
    res.json({ message: 'Listing removed' });
};

// @desc    Get listing by ID
// @route   GET /api/listings/:id
// @access  Public
const getListingById = async (req, res) => {
    let listing = null;
    try {
        listing = await Listing.findById(req.params.id).populate('providerId', 'name email');
    } catch (err) {
        // If ID is invalid format (cast error), it might be valid logic to ignore, but we can try provider fallback
    }

    if (!listing) {
        // Fallback: Check if the ID passed is actually a Provider (User) ID
        // This handles legacy bookings where we only stored providerId
        try {
            const providerListing = await Listing.findOne({ providerId: req.params.id }).populate('providerId', 'name email');
            if (providerListing) {
                listing = providerListing;
            }
        } catch (err) {
            // Ignore error
        }
    }

    if (listing) {
        res.json(listing);
    } else {
        res.status(404).json({ message: 'Listing not found' });
    }
};

module.exports = {
    createListing,
    getListings,
    getMyListings,
    deleteListing,
    getListingById
};
