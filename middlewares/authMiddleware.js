// Authentication & authorization

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { AppError } = require('./errorMiddleware');
const { JWT_SECRET } = require('../config/env'); 
const { getFirebaseAdmin } = require('../services/firebaseAdmin');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Handle missing token explicitly
  if (!token) {
    // This is a known, non-operational error, but we can also use AppError for consistency
    return next(new AppError('Not authorized to access this route', 401));
  }

  try {
    const firebaseAdmin = getFirebaseAdmin();

    if (!firebaseAdmin) {
      return next(new AppError('Firebase credentials are not configured', 500));
    }

    const decoded = await firebaseAdmin.auth().verifyIdToken(token);

    let user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) {
      const fallbackEmail = decoded.email || `${decoded.uid}@zipshift.app`;
      user = await User.create({
        firebaseUid: decoded.uid,
        authProvider: 'firebase',
        name: decoded.name || 'ZipShift Merchant',
        email: fallbackEmail,
        phone: decoded.phone_number || null
      });
    }

    req.user = user;
    req.auth = {
      firebase: decoded
    };

    next();
  } catch (error) {
    next(new AppError(error.message || 'Not authorized to access this route', 401));
  }
};

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // Use AppError for operational, predictable errors
      return next(new AppError(`User role '${req.user.role}' is not authorized to access this route`, 403));
    }
    next();
  };
};

// Generate JWT token
exports.generateToken = (id) => {
  const { JWT_SECRET, JWT_EXPIRE } = require('../config/env');
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE || '30d'
  });
};