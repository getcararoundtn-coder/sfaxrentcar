const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

// مسارات عامة
router.get('/latest', reviewController.getLatestReviews);
router.get('/car/:carId', reviewController.getCarReviews);

// مسارات محمية
router.post('/', protect, reviewController.createReview);
router.get('/my-reviews', protect, reviewController.getMyReviews);
router.get('/owner-reviews', protect, reviewController.getOwnerReviews);
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;