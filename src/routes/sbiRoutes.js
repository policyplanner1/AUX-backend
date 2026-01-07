const express = require('express');
const router = express.Router();
const sbiController = require('../controllers/sbiController');
const sbihcController = require('../controllers/sbihcController');
const sbigmcController = require('../controllers/sbiGMCController');
// POST /api/sbi/:companyId/:planId/premium
router.post('/:companyId/:planId/premium', sbiController.calculatePremium);

router.post('/:companyId/:planId/hc', sbihcController.getPremium);

router.post('/:companyId/:planId/gmc', sbigmcController.getPremium);
module.exports = router;
