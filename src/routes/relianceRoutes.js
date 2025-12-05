const express = require('express');
const router = express.Router();
const relianceController = require('../controllers/relianceController');
const reliancePAController = require('../controllers/reliancePAController');

// POST /api/reliance/:companyId/:planId/premium
router.post('/:companyId/:planId/premium', relianceController.calculatePremium);

router.post('/:companyId/:planId/pa', reliancePAController.getPremium);

module.exports = router;