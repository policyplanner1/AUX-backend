const express = require('express');
const router = express.Router();
const carePAController = require('../controllers/carePAController');

// POST /api/care/:companyId/:planId/pa
router.post('/:companyId/:planId/pa', carePAController.getPremium);


module.exports = router;