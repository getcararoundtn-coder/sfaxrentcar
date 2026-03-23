const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const carWizardController = require('../controllers/carWizardController');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadCarImages } = require('../config/cloudinary'); // ✅ إضافة استيراد uploadCarImages

// ========== المسارات العامة (لجميع المستخدمين) ==========
router.get('/', carController.getCars);
router.get('/featured', carController.getFeaturedCars);
router.get('/stats', carController.getCarStats);

// ========== المسارات الثابتة الخاصة بالمستخدم (تأتي قبل /:id) ==========
router.get('/my-cars', protect, carController.getMyCars);
router.get('/my-bookings', protect, carController.getMyCarBookings);
router.get('/owner-stats', protect, carController.getOwnerStats);

// ========== مسارات المشرف ==========
router.get('/all', protect, admin, carController.getAllCars);
router.get('/pending', protect, admin, carController.getPendingCars);
router.patch('/:id/approve', protect, admin, carController.approveCar);
router.patch('/:id/reject', protect, admin, carController.rejectCar);
router.patch('/:id/featured', protect, admin, carController.toggleFeatured);

// ========== مسارات الويزارد (Wizard) ==========
router.post('/wizard/save', protect, carWizardController.saveDraft);
router.get('/wizard/get', protect, carWizardController.getDraft);
// ✅ إضافة uploadCarImages لمعالجة رفع الصور
router.post('/wizard/complete', protect, uploadCarImages, carWizardController.completeWizard);

// ========== المسارات الديناميكية (تأتي في النهاية) ==========
router.get('/:id', carController.getCarById);
router.post('/', protect, carController.addCar);
router.put('/:id', protect, carController.updateCar);
router.delete('/:id', protect, carController.deleteCar);
router.patch('/:id/toggle-availability', protect, carController.toggleCarAvailability);
router.patch('/cancel-booking/:bookingId', protect, carController.cancelBookingByOwner);

module.exports = router;