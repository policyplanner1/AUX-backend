const express = require('express');
const router = express.Router();
const iciciController = require('../controllers/iciciController');
const iciciSuperTopupController = require('../controllers/iciciSuperTopupController');


// POST /api/icici/:companyId/:planId/premium
router.post('/:companyId/:planId/premium', iciciController.calculatePremium);

// POST /api/icici/:companyId/:planId/supertopup
router.post('/:companyId/:planId/supertopup', iciciSuperTopupController.calculateSuperTopupPremium); // New route for supertopup

module.exports = router;