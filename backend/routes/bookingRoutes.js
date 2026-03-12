const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

// مسارات المستخدمين العاديين
router.post('/', protect, bookingController.createBooking);
router.get('/my-bookings', protect, bookingController.getMyBookings);

// مسارات المشرف
router.get('/pending', protect, admin, bookingController.getPendingBookings);
router.get('/', protect, admin, bookingController.getAllBookings);
router.patch('/:id/status', protect, admin, bookingController.updateBookingStatus);

// مسار عام للمستخدم أو المشرف (لابد أن يكون في النهاية)
router.get('/:id', protect, bookingController.getBookingById);

module.exports = router;