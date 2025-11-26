// Authentication & authorization

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Rider = require('../models/riderModel');
const { AppError } = require('./errorMiddleware');
const { JWT_SECRET } = require('../config/env'); 
const { getFirebaseAdmin } = require('../services/firebaseAdmin');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  let token;

  console.log(`🔐 Auth Middleware: Request to ${req.originalUrl}`);

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('🔑 Token found in headers');
  } else {
    console.log('⚠️  No token found in headers');
  }

  // Handle missing token explicitly
  if (!token) {
    console.log('❌ Access denied: No token');
    return next(new AppError('Not authorized to access this route', 401));
  }

  try {
    const firebaseAdmin = getFirebaseAdmin();

    if (!firebaseAdmin) {
      console.error('🔥 Firebase Admin not initialized');
      return next(new AppError('Firebase credentials are not configured', 500));
    }

    console.log('🔄 Verifying Firebase token...');
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);
    console.log(`✅ Token verified for UID: ${decoded.uid}`);

    let user = await User.findOne({ firebaseUid: decoded.uid });
    
    // If not found in User, check Rider
    if (!user) {
      user = await Rider.findOne({ firebaseUid: decoded.uid });
      if (user) {
        user.role = 'rider'; // Ensure role is set for consistency in req.user
      }
    }

    if (!user) {
      // If still not found, check if it's a registration request
      console.log('🔍 Checking if request is for registration:', req.originalUrl, req.method);
      if (req.originalUrl.includes('/api/auth/register') && req.method === 'POST') {
        console.log('👤 User not found in DB, proceeding to registration...');
        req.user = null; // Explicitly set to null for controller to handle
      } else {
        console.log('❌ User not found in DB and not registering. URL:', req.originalUrl);
        return next(new AppError('User not registered. Please complete registration.', 401));
      }
    } else {
      console.log(`👤 User found in DB (${user.role || 'user'}):`, user._id);
      req.user = user;
    }
    req.auth = {
      firebase: decoded
    };

    next();
  } catch (error) {
    console.error('❌ Auth Middleware Error:', error.message);
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