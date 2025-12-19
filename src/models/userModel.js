// User schema (name, contact, payment status)

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'firebase'],
    default: 'local'
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    default: null
  },
  company: {
    type: String,
    default: ''
  },
  pickupArea: {
    type: String,
    default: ''
  },
  photoURL: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    select: false,
    required: function () {
      return !this.firebaseUid;
    }
  },
  address: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'rider'],
    default: 'user'
  },
  paymentStatus: {
    type: String,
    enum: ['active', 'pending', 'suspended'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

