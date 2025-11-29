const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  parcelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parcel',
    required: true
  },
  status: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Tracking', trackingSchema);
