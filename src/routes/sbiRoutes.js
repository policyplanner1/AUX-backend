const express = require('express');
const router = express.Router();
const sbiController = require('../controllers/sbiController');

// POST /api/sbi/:companyId/:planId/premium
router.post('/:companyId/:planId/premium', sbiController.calculatePremium);

module.exports = router;