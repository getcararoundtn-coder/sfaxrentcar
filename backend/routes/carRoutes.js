const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const carWizardController = require('../controllers/carWizardController');
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadCarImages } = require('../config/cloudinary');
const { upload } = require('../server'); // ✅ استيراد upload من server.js

// ========== المسارات العامة (لجميع المستخدمين) ==========
router.get('/', carController.getCars);
router.get('/featured', carController.getFeaturedCars);
router.get('/stats', carController.getCarStats);

// ========== المسارات الثابتة الخاصة بالمستخدم ==========
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

// ✅ استخدام multer لرفع الصور (بدلاً من uploadCarImages)
router.post('/wizard/complete', protect, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'insuranceFront', maxCount: 1 },
  { name: 'insuranceBack', maxCount: 1 }
]), carWizardController.completeWizard);

// ========== المسارات الديناميكية ==========
router.get('/:id', carController.getCarById);
router.post('/', protect, carController.addCar);
router.put('/:id', protect, carController.updateCar);
router.delete('/:id', protect, carController.deleteCar);
router.patch('/:id/toggle-availability', protect, carController.toggleCarAvailability);
router.patch('/cancel-booking/:bookingId', protect, carController.cancelBookingByOwner);

module.exports = router;