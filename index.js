// Server entry point

// Load environment variables first
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { PORT, NODE_ENV } = require('./config/env');

// Connect to database
connectDB();

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${NODE_ENV} mode`);
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📦 Parcels API: http://localhost:${PORT}/api/parcels`);
  console.log(`🏍️  Riders API: http://localhost:${PORT}/api/riders`);
  console.log(`👨‍💼 Admin API: http://localhost:${PORT}/api/admin`);
  console.log(`\n✅ Ready to accept requests from frontend!\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

