const express = require('express');
const router = express.Router();
const multer = require('multer');
const carController = require('../controllers/carController');
const carWizardController = require('../controllers/carWizardController');
const { protect, admin } = require('../middleware/authMiddleware');

// ✅ إعداد multer للملفات المؤقتة
const upload = multer({ 
  dest: '/tmp/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté'), false);
    }
  }
});

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

// ✅ استخدام multer لرفع الصور
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