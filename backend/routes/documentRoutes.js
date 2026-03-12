const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/upload', protect, documentController.uploadDocuments);
router.get('/my-docs', protect, documentController.getMyDocuments);
router.get('/pending', protect, admin, documentController.getPendingDocuments);
router.patch('/:userId/approve', protect, admin, documentController.approveDocument);
router.patch('/:userId/reject', protect, admin, documentController.rejectDocument);

module.exports = router;