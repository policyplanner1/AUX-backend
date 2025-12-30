const express = require('express');
const router = express.Router();
const unitedController = require('../controllers/unitedController');
const unitedSuperTopupController = require('../controllers/unitedSuperTopupController');
const unitedGMCController = require('../controllers/unitedGMCController');

router.post('/:companyId/:planId/premium', unitedController.calculatePremium);

router.post('/:companyId/:planId/supertopup', unitedSuperTopupController.calculateUnitedSuperTopupPremium);

router.post('/:companyId/:planId/gmc', unitedGMCController.getPremium);

module.exports = router;
