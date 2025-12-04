const express = require('express');
const router = express.Router();
const bajajController = require('../controllers/bajajController');
const bajajSuperTopupController = require('../controllers/bajajSuperTopupController');


// POST /api/bajaj/:companyId/:planId/premium
router.post('/:companyId/:planId/premium', bajajController.calculatePremium);

// POST /api/bajaj/:companyId/:planId/supertopup
router.post('/:companyId/:planId/supertopup', bajajSuperTopupController.calculateBAJAJSuperTopupPremium);

module.exports = router;