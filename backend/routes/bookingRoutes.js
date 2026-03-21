const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  updateBookingStatus,
  cancelBooking,
  completeBooking,
  getBookingById
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// جميع المسارات محمية (تتطلب تسجيل دخول)
router.use(protect);

// إنشاء حجز جديد
router.post('/', createBooking);

// جلب حجوزات المستخدم (كمستأجر)
router.get('/my-bookings', getMyBookings);

// جلب حجوزات سيارات المستخدم (كمالك)
router.get('/owner-bookings', getOwnerBookings);

// تحديث حالة الحجز (قبول/رفض)
router.patch('/:id/status', updateBookingStatus);

// إلغاء الحجز (بواسطة المستأجر)
router.patch('/:id/cancel', cancelBooking);

// إكمال الحجز (بواسطة المالك)
router.patch('/:id/complete', completeBooking);

// جلب تفاصيل حجز واحد
router.get('/:id', getBookingById);

module.exports = router;