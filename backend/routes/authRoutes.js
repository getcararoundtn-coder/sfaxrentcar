const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  logout, 
  getMe,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const supportController = require('../controllers/supportController');

// مسارات المصادقة
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// ✅ مسار الدعم (يتطلب تسجيل دخول)
router.post('/support', protect, supportController.sendMessage);

module.exports = router;