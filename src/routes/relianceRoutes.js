const express = require('express');
const router = express.Router();
const relianceController = require('../controllers/relianceController');
const reliancePAController = require('../controllers/reliancePAController');
const relianceHCController = require('../controllers/reliancehcController');

// POST /api/reliance/:companyId/:planId/premium
router.post('/:companyId/:planId/premium', relianceController.calculatePremium);

router.post('/:companyId/:planId/pa', reliancePAController.getPremium);

router.post('/:companyId/:planId/hc', relianceHCController.getPremium);

module.exports = router;
