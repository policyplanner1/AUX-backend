const express = require('express');
const router = express.Router();
const digitController = require('../controllers/digitController');

// POST /api/digit/:companyId/:planId/premium
router.post('/:companyId/:planId/premium', digitController.calculatePremium);


module.exports = router;