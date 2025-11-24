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
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  pickupArea: {
    type: String,
    default: ''
  },
  weight: {
    type: Number,
    required: true
  },
  codAmount: {
    type: Number,
    default: 0
  },
  note: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: [
      'Pending',
      'Picked',
      'On the way',
      'Delivered',
      'Cancelled',
      'pending',
      'assigned',
      'picked-up',
      'in-transit',
      'out-for-delivery',
      'delivered',
      'cancelled'
    ],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  currentHub: {
    type: String,
    default: 'Central Hub'
  },
  eta: {
    type: Date
  },
  weightUnit: {
    type: String,
    enum: ['kg', 'g', 'lb'],
    default: 'kg'
  },
  timeline: {
    type: [
      {
        label: String,
        time: {
          type: Date,
          default: Date.now
        },
        done: {
          type: Boolean,
          default: false
        },
        location: {
          type: String,
          default: ''
        },
        status: {
          type: String,
          default: 'Pending'
        }
      }
    ],
    default: []
  },
  warehouse: {
    type: String,
    default: null
  },
  senderName: {
    type: String,
    default: ''
  },
  senderPhone: {
    type: String,
    default: ''
  },
  senderAddress: {
    type: String,
    default: ''
  },
  recipientName: {
    type: String,
    default: ''
  },
  recipientPhone: {
    type: String,
    default: ''
  },
  recipientAddress: {
    type: String,
    default: ''
  },
  city: {
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

