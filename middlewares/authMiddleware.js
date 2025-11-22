// Authentication & authorization

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { AppError } = require('./errorMiddleware');
const { JWT_SECRET } = require('../config/env'); 

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
    // Verify token
    if (!JWT_SECRET) {
      return next(new AppError('JWT_SECRET is not configured', 500));
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      // If user is not found after token verification, treat as 401
      return next(new AppError('User belonging to this token no longer exists', 401));
    }

    next();
  } catch (error) {
    // FIX: Any error thrown during jwt.verify() (JsonWebTokenError, TokenExpiredError) 
    // or database lookup is now passed to the global error handler (errorMiddleware.js).
    next(error);
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