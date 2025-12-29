const express = require('express');
const router = express.Router();
const unitedSuperTopupController = require('../controllers/unitedSuperTopupController');
const unitedGMCController = require('../controllers/unitedGMCController');

router.post('/:companyId/:planId/supertopup', unitedSuperTopupController.calculateUnitedSuperTopupPremium);

router.post('/:companyId/:planId/gmc', unitedGMCController.getPremium);

module.exports = router;
