const express = require('express');
const router = express.Router();
const starController = require('../controllers/starController');

// POST /api/star/:companyId/:planId/premium
router.post('/:companyId/:planId/premium', starController.calculatePremium);
module.exports = router;