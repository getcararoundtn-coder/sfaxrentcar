const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

router.get('/featured', companyController.getFeaturedCompanies);

module.exports = router;