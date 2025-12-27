const express = require('express');
const router = express.Router();
const niaController = require('../controllers/niaController');
// const bajajSuperTopupController = require('../controllers/bajajSuperTopupController');
// const bajajPAController = require('../controllers/bajajPAController');

// POST /api/nia/:companyId/:planId/premium
router.post('/:companyId/:planId/premium', niaController.calculatePremium);

// POST /api/nia/:companyId/:planId/supertopup
// router.post('/:companyId/:planId/supertopup', bajajSuperTopupController.calculateBAJAJSuperTopupPremium);

// router.post('/:companyId/:planId/pa', bajajPAController.getPremium);


module.exports = router;
