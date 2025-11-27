const express = require('express');
const router = express.Router();
const hdfcController = require('../controllers/hdfcController');
const hdfcSuperTopupController = require('../controllers/hdfcSuperTopupController');


// POST /api/hdfc/:companyId/:planId/premium
router.post('/:companyId/:planId/premium', hdfcController.calculatePremium);

router.post('/:companyId/:planId/supertopup', hdfcSuperTopupController.calculateHDFCSuperTopupPremium);

module.exports = router;