// routes/index.js
const express = require('express');
const router = express.Router();

const companiesController = require('../controllers/companyController');

// GET /api/companies/plans?policy=Health
router.get('/plans', companiesController.getActiveCompaniesWithPlans);

module.exports = router;
