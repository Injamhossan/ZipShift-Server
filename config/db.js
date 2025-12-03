// Database connection using Mongoose

const mongoose = require('mongoose');
const { MONGODB_URI, NODE_ENV } = require('./env');

const connectDB = async () => {
  try {
    // Ensure MONGODB_URI is set
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }
    
    // Ensure database name is 'zip_shift' in connection string
    let connectionString = MONGODB_URI.trim();
    
    // Parse and set database name properly
    // Check if URI already has a database name (after last / and before ?)
    const dbNameMatch = connectionString.match(/mongodb\+?srv?:\/\/[^\/]+\/([^\/\?]+)/);
    
    if (!dbNameMatch || dbNameMatch[1] === '') {
      // No database name found, add 'zip_shift'
      if (connectionString.includes('?')) {
        // Insert database name before query params
        connectionString = connectionString.replace(/\?/, '/zip_shift?');
      } else if (connectionString.endsWith('/')) {
        // Remove trailing slash and add database name
        connectionString = connectionString.replace(/\/$/, '') + '/zip_shift';
      } else {
        // Add database name at the end
        connectionString = connectionString + '/zip_shift';
      }
    } else {
      // Database name exists, but we want to use 'zip_shift'
      // Replace existing database name with 'zip_shift'
      connectionString = connectionString.replace(/\/[^\/\?]+(\?|$)/, '/zip_shift$1');
    }
    
    console.log(`🔄 Connecting to MongoDB...`);
    console.log(`📦 Database: zip_shift`);
    

    const conn = await mongoose.connect(connectionString, {
      dbName: 'zip_shift', // Explicitly set database name
    });
    
    console.log(`✅ MongoDB Connected successfully!`);
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    console.log(`📊 Collections: users, parcels, riders, admin`);
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Tip: Make sure MongoDB is running or check your MONGODB_URI in .env file');
      console.error('   For local MongoDB: Start MongoDB service');
      console.error('   For MongoDB Atlas: Check your connection string');
    }
    // Don't exit in development - allow server to start without DB
    if (NODE_ENV === 'production') {
      console.error('⚠️  Exiting in production mode due to database connection failure');
      process.exit(1);
    } else {
      console.warn('⚠️  Server will continue without database connection (development mode)');
    }
  }
};

module.exports = connectDB;