// Parcel schema (status, sender info, destination)

const mongoose = require('mongoose');

const parcelSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pickupRiderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider',
    default: null
  },
  deliveryRiderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider',
    default: null
  },
  parcelType: {
    type: String,
    enum: ['document', 'non-document'],
    default: 'non-document'
  },
  weight: {
    type: Number,
    required: function() { return this.parcelType === 'non-document'; }
  },
  cost: {
    type: Number,
    required: true
  },
  senderInfo: {
    name: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    region: { type: String, default: '' },
    serviceCenter: { type: String, default: '' },
    instruction: { type: String, default: '' }
  },
  receiverInfo: {
    name: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    region: { type: String, default: '' },
    serviceCenter: { type: String, default: '' },
    instruction: { type: String, default: '' }
  },
  status: {
    type: String,
    enum: [
      'unpaid',
      'paid',
      'ready-to-pickup',
      'in-transit',
      'reached-service-center',
      'shipped',
      'ready-for-delivery',
      'delivered',
      'cancelled'
    ],
    default: 'unpaid'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  trackingNumber: {
    type: String,
    unique: true,
    required: true
  },
  creationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

parcelSchema.virtual('trackingId').get(function () {
  return this.trackingNumber;
});

// Generate tracking number before saving
parcelSchema.pre('save', async function(next) {
  if (!this.trackingNumber) {
    this.trackingNumber = `ZIP${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

module.exports = mongoose.model('Parcel', parcelSchema);

