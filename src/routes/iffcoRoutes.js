const express = require('express');
const router = express.Router();
// const bajajController = require('../controllers/bajajController');
const iffcoSuperTopupController = require('../controllers/iffcoSuperTopupController');
// const bajajPAController = require('../controllers/bajajPAController');

// POST /api/bajaj/:companyId/:planId/premium
// router.post('/:companyId/:planId/premium', bajajController.calculatePremium);

// POST /api/bajaj/:companyId/:planId/supertopup
router.post('/:companyId/:planId/supertopup', iffcoSuperTopupController.calculateIFFCOSuperTopupPremium);

// router.post('/:companyId/:planId/pa', bajajPAController.getPremium);


module.exports = router;
