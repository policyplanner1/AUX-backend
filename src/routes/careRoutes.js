const express = require('express');
const router = express.Router();
const carePAController = require('../controllers/carePAController');
const careGMCController = require('../controllers/careGMCController');

// POST /api/care/:companyId/:planId/pa
router.post('/:companyId/:planId/pa', carePAController.getPremium);

router.post('/:companyId/:planId/gmc', careGMCController.getPremium);

module.exports = router;