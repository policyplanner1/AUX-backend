const express = require('express');
const router = express.Router();
const bajajController = require('../controllers/bajajController');

// POST /api/bajaj/:companyId/:planId/premium
router.post('/:companyId/:planId/premium', bajajController.calculatePremium);

module.exports = router;