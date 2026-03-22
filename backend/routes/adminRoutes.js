const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const supportController = require('../controllers/supportController');
const { protect, admin } = require('../middleware/authMiddleware');

// جميع المسارات محمية وتتطلب صلاحية مشرف
router.use(protect, admin);

// ==================== الإحصائيات ====================
router.get('/stats', adminController.getStats);
router.get('/stats/advanced', adminController.getAdvancedStats);

// ==================== طلبات التحقق ====================
router.get('/verifications/pending', adminController.getPendingVerifications);
router.patch('/verifications/:userId/approve', adminController.approveVerification);
router.patch('/verifications/:userId/reject', adminController.rejectVerification);

// ==================== المستخدمين ====================
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/status', adminController.toggleUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// ==================== السيارات ====================
router.get('/cars/all', adminController.getAllCars);
router.get('/cars/pending', adminController.getPendingCars);
router.patch('/cars/:id/approve', adminController.approveCar);
router.patch('/cars/:id/reject', adminController.rejectCar);
router.put('/cars/:id', adminController.updateCar);
router.delete('/cars/:id', adminController.deleteCar);
router.patch('/cars/:id/featured', adminController.toggleFeatured);

// ==================== الحجوزات ====================
router.get('/bookings/pending', adminController.getPendingBookings);
router.get('/bookings/all', adminController.getAllBookings);
router.get('/bookings/:id', adminController.getBookingById);
router.patch('/bookings/:id/status', adminController.updateBookingStatus);

// ==================== الوثائق ====================
router.get('/documents', adminController.getAllDocuments);
router.get('/documents/pending', adminController.getPendingDocuments);
router.get('/documents/:id', adminController.getDocumentById);
router.patch('/documents/:id/approve', adminController.approveDocument);
router.patch('/documents/:id/reject', adminController.rejectDocument);
router.delete('/documents/:id', adminController.deleteDocument);

// ==================== الرسائل ====================
router.get('/messages', adminController.getAllMessages);
router.get('/messages/unread', adminController.getUnreadMessages);
router.get('/messages/:id', adminController.getMessageById);
router.post('/messages/:id/reply', adminController.replyToMessage);
router.delete('/messages/:id', adminController.deleteMessage);

// ==================== التقارير ====================
router.post('/reports/generate', adminController.generateReport);
router.get('/reports/:type', adminController.getReport);

// ==================== دعم العملاء / تواصل معنا ====================
router.get('/support/stats', supportController.getSupportStats);
router.get('/support/messages', supportController.getSupportMessages);
router.get('/support/messages/:id', supportController.getSupportMessageById);
router.post('/support/messages/:id/reply', supportController.replyToSupport);
router.patch('/support/messages/:id/status', supportController.updateMessageStatus);
router.delete('/support/messages/:id', supportController.deleteSupportMessage);

module.exports = router;