const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect, admin } = require('../middleware/authMiddleware');

// جميع المسارات محمية (تتطلب تسجيل دخول)
router.use(protect);

// ✅ المسارات الثابتة (static routes) - يجب أن تأتي قبل المسارات الديناميكية
router.get('/conversations', messageController.getMyConversations);
router.get('/unread-count', messageController.getUnreadCount);

// ✅ المسارات الديناميكية (dynamic routes)
// GET /api/messages/booking/:bookingId - جلب رسائل حجز معين
router.get('/booking/:bookingId', messageController.getMessagesByBooking);

// POST /api/messages/booking/:bookingId - إرسال رسالة لحجز معين
router.post('/booking/:bookingId', messageController.sendMessage);

// PUT /api/messages/booking/:bookingId/read - تحديث حالة القراءة لجميع رسائل الحجز
router.put('/booking/:bookingId/read', messageController.markAsRead);

// DELETE /api/messages/:id - حذف رسالة معينة (للمشرف أو المرسل)
router.delete('/:id', messageController.deleteMessage);

// ⚠️ مسار الرد مؤقتاً معطل حتى يتم إضافة الدالة
// router.post('/:id/reply', protect, admin, messageController.replyToMessage);

module.exports = router;