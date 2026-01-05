const express = require('express');
const router = express.Router();
const nicController = require('../controllers/nicController');
const nicSuperTopupController = require('../controllers/nicSuperTopupController');
const nichcController = require('../controllers/nichcController');

// POST /api/nic/:companyId/:planId/premium
router.post('/:companyId/:planId/premium', nicController.calculatePremium);

router.post('/:companyId/:planId/supertopup', nicSuperTopupController.calculateNICSuperTopupPremium);

router.post('/:companyId/:planId/hc', nichcController.getPremium);

module.exports = router;