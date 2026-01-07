const express = require('express');
const router = express.Router();
const generaliController = require('../controllers/generaliController');


router.post('/:companyId/:planId/hc', generaliController.getPremium);

module.exports = router;
