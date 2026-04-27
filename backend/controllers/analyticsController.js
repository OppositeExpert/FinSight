const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// @desc    Get month-over-month income vs expense trends (last 6 months)
// @route   GET /api/analytics/trends
// @access  Private
const getTrends = async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const trends = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Transform into a cleaner format: [{ month: "2026-04", income: 50000, expense: 12000 }, ...]
    const monthMap = {};

    // Pre-fill the last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap[key] = { month: key, income: 0, expense: 0 };
    }

    trends.forEach((item) => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      if (monthMap[key]) {
        monthMap[key][item._id.type || 'expense'] = Math.round(item.total * 100) / 100;
      }
    });

    res.json(Object.values(monthMap));
  } catch (error) {
    console.error('Get trends error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get daily spending amounts for a given month
// @route   GET /api/analytics/heatmap?month=2026-04
// @access  Private
const getHeatmap = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ message: 'Month parameter is required' });
    }

    const [year, mon] = month.split('-').map(Number);
    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 0, 23, 59, 59, 999);
    const daysInMonth = new Date(year, mon, 0).getDate();

    const heatmap = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          type: 'expense',
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: '$date' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Fill in all days of the month
    const result = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const found = heatmap.find((h) => h._id === day);
      result.push({
        day,
        date: `${year}-${String(mon).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        total: found ? Math.round(found.total * 100) / 100 : 0,
        count: found ? found.count : 0,
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Get heatmap error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTrends, getHeatmap };
