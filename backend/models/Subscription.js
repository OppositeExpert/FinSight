const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a subscription name'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide an amount'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    dueDate: {
      type: Number,
      required: [true, 'Please provide a due date (day of month)'],
      min: 1,
      max: 31,
    },
    cycle: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly'],
      default: 'monthly',
    },
    category: {
      type: String,
      default: 'Bills',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
