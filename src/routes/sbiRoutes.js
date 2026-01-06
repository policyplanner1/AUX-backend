const express = require('express');
const router = express.Router();
const sbiController = require('../controllers/sbiController');
const sbihcController = require('../controllers/sbihcController');

// POST /api/sbi/:companyId/:planId/premium
router.post('/:companyId/:planId/premium', sbiController.calculatePremium);

router.post('/:companyId/:planId/hc', sbihcController.getPremium);
module.exports = router;
