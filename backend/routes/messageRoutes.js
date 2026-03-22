const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect, admin } = require('../middleware/authMiddleware');

// جميع المسارات محمية (تتطلب تسجيل دخول)
router.use(protect);

// ✅ هذه المسارات الثابتة (static routes) يجب أن تأتي قبل المسارات الديناميكية (/:id)
router.get('/conversations', messageController.getConversations);
router.get('/unread-count', messageController.getUnreadCount);
router.get('/my-messages', messageController.getMyMessages); // إذا كانت هذه الدالة موجودة

// ✅ المسارات الديناميكية (تأتي في النهاية)
router.post('/', messageController.sendMessage);
router.get('/:bookingId', messageController.getMessages);
router.patch('/:id/read', messageController.markAsRead);
router.delete('/:id', messageController.deleteMessage);

// مسارات المشرف
router.post('/:id/reply', protect, admin, messageController.replyToMessage);

module.exports = router;