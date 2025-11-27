const express = require('express');
const router = express.Router();
const nivaController = require('../controllers/nivaController');

// POST /api/niva/:companyId/:planId/premium
router.post('/:companyId/:planId/premium', nivaController.calculatePremium);

module.exports = router;