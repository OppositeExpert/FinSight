const express = require('express');
const router = express.Router();
const { getBudget, saveBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getBudget).post(protect, saveBudget);

module.exports = router;
