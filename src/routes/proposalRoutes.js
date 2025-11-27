// routes/proposalRoutes.js
const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposalController');

// POST /proposals/save
router.post('/save', proposalController.createProposal);

module.exports = router;
