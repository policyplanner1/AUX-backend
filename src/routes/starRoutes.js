const express = require('express');
const router = express.Router();
const starController = require('../controllers/starController');
const starPAController = require('../controllers/starPAController');

// POST /api/star/:companyId/:planId/premium
router.post('/:companyId/:planId/premium', starController.calculatePremium);

router.post('/:companyId/:planId/pa', starPAController.getPremium);

module.exports = router;