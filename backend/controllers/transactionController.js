const Transaction = require('../models/Transaction');

// @desc    Add a new transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res) => {
  try {
    const { type, amount, category, date, notes } = req.body;

    const transaction = await Transaction.create({
      user: req.user._id,
      type: type || 'expense',
      amount,
      category,
      date: date || Date.now(),
      notes: notes || '',
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Add transaction error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all transactions for the logged-in user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { month, type } = req.query;
    let filter = { user: req.user._id };

    if (month) {
      const [year, mon] = month.split('-').map(Number);
      const startDate = new Date(year, mon - 1, 1);
      const endDate = new Date(year, mon, 0, 23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    if (type && ['income', 'expense'].includes(type)) {
      filter.type = type;
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Make sure user owns the transaction
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this transaction' });
    }

    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction removed', id: req.params.id });
  } catch (error) {
    console.error('Delete transaction error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addTransaction, getTransactions, deleteTransaction };
