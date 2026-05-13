const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a review (authenticated users only)
router.post('/', protect, reviewController.createReview);

// Get all reviews for a seller
router.get('/seller/:sellerId', reviewController.getSellerReviews);

// Get all reviews given by the authenticated buyer
router.get('/buyer/my-reviews', protect, reviewController.getBuyerReviews);

// Update a review (authenticated users only)
router.put('/:reviewId', protect, reviewController.updateReview);

// Delete a review (authenticated users only)
router.delete('/:reviewId', protect, reviewController.deleteReview);

module.exports = router;
