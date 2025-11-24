const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  updates: {
    type: [
      {
        message: String,
        createdAt: {
          type: Date,
          default: Date.now
        },
        author: {
          type: String,
          default: 'customer'
        }
      }
    ],
    default: []
  }
}, {
  timestamps: true
});

supportTicketSchema.pre('save', function (next) {
  if (!this.ticketNumber) {
    this.ticketNumber = `TCK-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 999)}`;
  }
  next();
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);

