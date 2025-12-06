const express = require('express');
const router = express.Router();
const iciciController = require('../controllers/iciciController');
const iciciSuperTopupController = require('../controllers/iciciSuperTopupController');
const iciciPAController = require('../controllers/iciciPAcontroller')


// POST /api/icici/:companyId/:planId/premium
router.post('/:companyId/:planId/premium', iciciController.calculatePremium);

// POST /api/icici/:companyId/:planId/supertopup
router.post('/:companyId/:planId/supertopup', iciciSuperTopupController.calculateSuperTopupPremium);

router.post('/:companyId/:planId/pa', iciciPAController.getPremium);

module.exports = router;