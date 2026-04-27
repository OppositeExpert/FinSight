const Budget = require('../models/Budget');

// @desc    Get budget for a specific month
// @route   GET /api/budgets?month=2026-04
// @access  Private
const getBudget = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ message: 'Month parameter is required (YYYY-MM)' });
    }

    const budget = await Budget.findOne({ user: req.user._id, month });
    res.json(budget || { month, limits: {} });
  } catch (error) {
    console.error('Get budget error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Set/update budget for a specific month (upsert)
// @route   POST /api/budgets
// @access  Private
const saveBudget = async (req, res) => {
  try {
    const { month, limits } = req.body;

    if (!month || !limits) {
      return res.status(400).json({ message: 'Month and limits are required' });
    }

    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, month },
      { user: req.user._id, month, limits },
      { upsert: true, new: true, runValidators: true }
    );

    res.json(budget);
  } catch (error) {
    console.error('Save budget error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBudget, saveBudget };
