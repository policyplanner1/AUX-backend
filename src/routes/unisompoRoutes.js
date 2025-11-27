const express = require('express');
const router = express.Router();
const unisompoController = require('../controllers/unisompoController');

// POST /api/unisompo/:companyId/:planId/premium
router.post('/:companyId/:planId/premium', unisompoController.calculatePremium);

module.exports = router;