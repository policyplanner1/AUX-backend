const express = require('express');
const router = express.Router();
const relianceController = require('../controllers/relianceController');

// POST /api/reliance/:companyId/:planId/premium
router.post('/:companyId/:planId/premium', relianceController.calculatePremium);

module.exports = router;