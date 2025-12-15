const express = require('express');
const router = express.Router();
const nivabupaPAController = require('../controllers/nivabupaPAController');

// POST /api/reliance/:companyId/:planId/premium

router.post('/:companyId/:planId/pa', nivabupaPAController.getPremium);


module.exports = router;
