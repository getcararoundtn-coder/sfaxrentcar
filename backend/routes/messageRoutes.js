const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect, admin } = require('../middleware/authMiddleware');

// جميع المسارات محمية (تتطلب تسجيل دخول)
router.use(protect);

// مسارات الرسائل
router.post('/', messageController.sendMessage);
router.get('/conversations', messageController.getConversations);
router.get('/unread-count', messageController.getUnreadCount);
router.get('/:bookingId', messageController.getMessages);
router.patch('/:id/read', messageController.markAsRead);
router.delete('/:id', messageController.deleteMessage);  // ✅ الآن الدالة موجودة

// مسارات المشرف
router.post('/:id/reply', protect, admin, messageController.replyToMessage);

module.exports = router;