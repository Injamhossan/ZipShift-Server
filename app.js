// Main Express app

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { errorHandler } = require('./middlewares/errorMiddleware');

// Import routes
const parcelRoutes = require('./routes/parcelRoutes');
const riderRoutes = require('./routes/riderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const billingRoutes = require('./routes/billingRoutes');
const supportRoutes = require('./routes/supportRoutes');
const profileRoutes = require('./routes/profileRoutes');
const trackingRoutes = require('./routes/trackingRoutes');

const app = express();

// CORS Configuration for Frontend Access
const corsOptions = {
  origin: function (origin, callback) {
    // In development, allow ALL origins (more permissive)
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // List of allowed origins for production
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:5174',
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // In production, log but allow for now (you can make it strict later)
      console.warn(`⚠️  CORS: Request from unknown origin: ${origin}`);
      callback(null, true); // Allow for now, change to callback(new Error(...)) for strict mode
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Delivery Backend API',
    version: '1.0.0',
    endpoints: {
      parcels: '/api/parcels',
      riders: '/api/riders',
      admin: '/api/admin'
    },
    status: 'Running'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for frontend
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working! Frontend can connect successfully.',
    data: {
      server: 'Running',
      timestamp: new Date().toISOString(),
      endpoints: {
        parcels: '/api/parcels',
        riders: '/api/riders',
        health: '/api/health'
      }
    }
  });
});

const authRoutes = require('./routes/authRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/parcels', parcelRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/admin', adminRoutes);

// Handle 404 - must be before error handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;

