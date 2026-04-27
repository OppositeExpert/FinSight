const mongoose = require('mongoose');

const EXPENSE_CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Shopping',
  'Bills', 'Health', 'Education', 'Other',
];

const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Gift', 'Refund', 'Other',
];

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      default: 'expense',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      validate: {
        validator: function (value) {
          if (this.type === 'income') {
            return INCOME_CATEGORIES.includes(value);
          }
          return EXPENSE_CATEGORIES.includes(value);
        },
        message: (props) => `${props.value} is not a valid category`,
      },
    },
    date: {
      type: Date,
      required: [true, 'Please provide a date'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// Index for efficient queries by user and date
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
module.exports.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;
module.exports.INCOME_CATEGORIES = INCOME_CATEGORIES;
