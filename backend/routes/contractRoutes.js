const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { protect, admin } = require('../middleware/authMiddleware');

// إنشاء عقد (للمشرف فقط – يمكن استدعاؤه بعد الموافقة)
router.post('/generate/:bookingId', protect, admin, contractController.generateContract);

// توقيع العقد (للمستأجر)
router.patch('/sign/:bookingId', protect, contractController.signContract);

module.exports = router;