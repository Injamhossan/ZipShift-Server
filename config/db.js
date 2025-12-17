const mongoose = require('mongoose');
const { MONGODB_URI, NODE_ENV } = require('./env');

const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    // console.log(`🔄 Connecting to MongoDB...`);

    // Use standard mongoose connect with explicit dbName
    // This avoids complex URI string manipulation
    const conn = await mongoose.connect(MONGODB_URI, {
      dbName: 'zip_shift',
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    // In production we might want to fail hard, but in dev we can keep running
    if (NODE_ENV === 'production') {
      console.error('⚠️  Exiting due to database connection failure');
      process.exit(1);
    }
  }
};

module.exports = connectDB;