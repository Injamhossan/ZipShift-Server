// Database connection

const { MongoClient } = require('mongodb'); // FIX: Use MongoClient
const { MONGODB_URI, NODE_ENV } = require('./env');

const connectDB = async () => {
  try {
    if (!MONGODB_URI || MONGODB_URI === 'mongodb://localhost:27017/delivery-app') {
      console.warn('⚠️  Using default MongoDB URI. Please set MONGODB_URI in .env file');
    }
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }
    
    console.log(`🔄 Connecting to MongoDB...`);
    
    // FIX: Use the native MongoDB driver's MongoClient to establish connection
    const client = new MongoClient(MONGODB_URI);
    const conn = await client.connect(); 
    
    // যেহেতু নেটিভ ড্রাইভারের ক্ষেত্রে 'conn.connection.host' মঙ্গুজের মতো সরাসরি পাওয়া যায় না, 
    // তাই একটি সাধারণ কানেকশন সাকসেস মেসেজ ব্যবহার করা হয়েছে।
    // অথবা আপনি চাইলে client.options.hosts[0].host বা client.options.srvHost ব্যবহার করতে পারেন।
    console.log(`✅ MongoDB Connected successfully!`);

    // আপনি চাইলে কানেকশন ক্লোজ করার জন্য client.close() ব্যবহার করতে পারেন, তবে সাধারণত সার্ভার বন্ধ না হওয়া পর্যন্ত কানেকশন খোলা রাখা হয়।
    
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