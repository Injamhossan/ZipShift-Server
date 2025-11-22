// Parcel schema (status, sender info, destination)

const mongoose = require('mongoose');

const parcelSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider',
    default: null
  },
  senderName: {
    type: String,
    required: true
  },
  senderPhone: {
    type: String,
    required: true
  },
  senderAddress: {
    type: String,
    required: true
  },
  recipientName: {
    type: String,
    required: true
  },
  recipientPhone: {
    type: String,
    required: true
  },
  recipientAddress: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'picked-up', 'in-transit', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  warehouse: {
    type: String,
    default: null
  },
  weight: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  trackingNumber: {
    type: String,
    unique: true,
    required: true
  },
  pickedUpAt: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Generate tracking number before saving
parcelSchema.pre('save', async function(next) {
  if (!this.trackingNumber) {
    this.trackingNumber = `ZIP${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

module.exports = mongoose.model('Parcel', parcelSchema);

