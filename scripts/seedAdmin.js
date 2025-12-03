const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/userModel');
const { getFirebaseAdmin } = require('../services/firebaseAdmin');

async function seedAdmin() {
  try {
    // 1. Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 2. Initialize Firebase Admin
    console.log('🔥 Initializing Firebase Admin...');
    const firebaseAdmin = getFirebaseAdmin();
    if (!firebaseAdmin) {
      throw new Error('Failed to initialize Firebase Admin. Check your .env credentials.');
    }

    const email = 'admin@gmail.com'; // As requested by user
    const password = 'admin123';
    let firebaseUid;

    // 3. Create or Get Firebase User
    try {
      console.log(`🔍 Checking if Firebase user exists: ${email}`);
      const userRecord = await firebaseAdmin.auth().getUserByEmail(email);
      firebaseUid = userRecord.uid;
      console.log(`✅ Firebase user found. UID: ${firebaseUid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('🆕 Creating new Firebase user...');
        const userRecord = await firebaseAdmin.auth().createUser({
          email,
          password,
          displayName: 'Admin User',
          emailVerified: true,
        });
        firebaseUid = userRecord.uid;
        console.log(`✅ Firebase user created. UID: ${firebaseUid}`);
      } else {
        throw error;
      }
    }

    // 4. Create or Update MongoDB User
    console.log(`🔍 Checking MongoDB user with UID: ${firebaseUid}`);
    let user = await User.findOne({ firebaseUid });

    if (user) {
      console.log('👤 User found in MongoDB. Updating role to admin...');
      user.role = 'admin';
      user.email = email; // Ensure email matches
      await user.save();
      console.log('✅ User updated to admin successfully.');
    } else {
      console.log('🆕 Creating new MongoDB user...');
      user = await User.create({
        firebaseUid,
        name: 'Admin User',
        email,
        phone: '0000000000', // Dummy phone to satisfy unique constraint
        role: 'admin',
        authProvider: 'firebase'
      });
      console.log('✅ Admin user created in MongoDB successfully.');
    }

  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit();
  }
}

seedAdmin();
