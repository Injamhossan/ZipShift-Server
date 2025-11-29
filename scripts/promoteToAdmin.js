const mongoose = require('mongoose');
const User = require('../models/userModel');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const promoteToAdmin = async (email) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email });

    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log(`User ${user.name} (${user.email}) promoted to ADMIN successfully!`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

const email = process.argv[2];

if (!email) {
  console.log('Please provide an email address.');
  console.log('Usage: node scripts/promoteToAdmin.js <email>');
  process.exit(1);
}

promoteToAdmin(email);
