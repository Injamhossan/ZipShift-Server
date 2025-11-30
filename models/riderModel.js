// Rider schema (availability, assigned parcels)

const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  vehicleType: {
    type: String,
    enum: ['bike', 'car', 'van'],
    default: 'bike'
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: true
  },
  company: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  pickupArea: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  assignedParcels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parcel'
  }],
  currentLocation: {
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    }
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  earnings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Rider', riderSchema);

