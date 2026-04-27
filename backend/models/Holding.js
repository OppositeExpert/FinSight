const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assetId: {
      type: String,
      required: [true, 'Please provide an asset'],
      enum: ['BTC', 'GOLD', 'NIFTY50'],
    },
    buyPrice: {
      type: Number,
      required: [true, 'Please provide a buy price'],
      min: [0, 'Price must be positive'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide a quantity'],
      min: [0.0001, 'Quantity must be greater than 0'],
    },
    buyDate: {
      type: Date,
      required: [true, 'Please provide a date'],
      default: Date.now,
    },
    type: {
      type: String,
      required: [true, 'Please provide transaction type'],
      enum: ['BUY', 'SELL'],
    },
  },
  { timestamps: true }
);

// Index for efficient queries by user and date
holdingSchema.index({ user: 1, buyDate: -1 });

module.exports = mongoose.model('Holding', holdingSchema);
