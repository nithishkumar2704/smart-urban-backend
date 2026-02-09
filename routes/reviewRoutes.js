const express = require('express');
const router = express.Router();
const { createReview, getReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createReview);

router.route('/:providerId')
    .get(getReviews);

module.exports = router;
