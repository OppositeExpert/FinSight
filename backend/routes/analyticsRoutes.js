const express = require('express');
const router = express.Router();
const { getTrends, getHeatmap } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/trends', protect, getTrends);
router.get('/heatmap', protect, getHeatmap);

module.exports = router;
