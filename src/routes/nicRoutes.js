const express = require('express');
const router = express.Router();
const nicController = require('../controllers/nicController');
const nicSuperTopupController = require('../controllers/nicSuperTopupController');

// POST /api/nic/:companyId/:planId/premium
router.post('/:companyId/:planId/premium', nicController.calculatePremium);

router.post('/:companyId/:planId/supertopup', nicSuperTopupController.calculateNICSuperTopupPremium);

module.exports = router;