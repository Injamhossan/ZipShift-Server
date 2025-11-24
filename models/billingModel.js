const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  reference: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed'],
    default: 'pending'
  },
  method: {
    type: String,
    default: 'bank-transfer'
  },
  initiatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const billingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    required: true
  },
  walletBalance: {
    type: Number,
    default: 0
  },
  pendingCod: {
    type: Number,
    default: 0
  },
  lastPayout: {
    amount: {
      type: Number,
      default: 0
    },
    date: Date,
    reference: String
  },
  payouts: {
    type: [payoutSchema],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Billing', billingSchema);

