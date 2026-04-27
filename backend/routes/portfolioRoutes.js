const express = require('express');
const router = express.Router();
const { getPortfolio, getPortfolioHistory, addHolding } = require('../controllers/portfolioController');
const { protect } = require('../middleware/auth');

// All portfolio routes are protected
router.route('/').get(protect, getPortfolio).post(protect, addHolding);
router.route('/history').get(protect, getPortfolioHistory);

module.exports = router;
