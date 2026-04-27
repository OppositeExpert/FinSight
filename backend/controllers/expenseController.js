const Expense = require('../models/Expense');

// @desc    Add a new expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res) => {
  try {
    const { amount, category, date, notes } = req.body;

    const expense = await Expense.create({
      user: req.user._id,
      amount,
      category,
      date: date || Date.now(),
      notes: notes || '',
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Add expense error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all expenses for the logged-in user
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const { month } = req.query; // format: "2026-04"
    let filter = { user: req.user._id };

    if (month) {
      const [year, mon] = month.split('-').map(Number);
      const startDate = new Date(year, mon - 1, 1);
      const endDate = new Date(year, mon, 0, 23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Make sure user owns the expense
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this expense' });
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense removed', id: req.params.id });
  } catch (error) {
    console.error('Delete expense error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addExpense, getExpenses, deleteExpense };
