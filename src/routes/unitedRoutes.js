const express = require('express');
const router = express.Router();
const unitedSuperTopupController = require('../controllers/unitedSuperTopupController');

router.post('/:companyId/:planId/supertopup', unitedSuperTopupController.calculateUnitedSuperTopupPremium);



module.exports = router;
