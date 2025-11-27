const express = require('express');
const router = express.Router();
const tataController = require('../controllers/tataController');
const tataSuperTopupController = require('../controllers/tataSuperTopupController');

// POST /api/tata/:companyId/:planId/premium
router.post('/:companyId/:planId/premium', tataController.calculatePremium);

router.post('/:companyId/:planId/supertopup', tataSuperTopupController.calculateTATASuperTopupPremium);

module.exports = router;