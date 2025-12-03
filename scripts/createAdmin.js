const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/userModel');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("Connected to DB");

    const email = "admin@gmail.com";   // পরিবর্তন করতে পারো
    const password = "Admin123";       // পরিবর্তন করতে পারো

    let user = await User.findOne({ email });

    if (user) {
      user.role = "admin";
      await user.save();
      console.log("Existing user updated to admin");
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    // Create admin inside **users** collection
    user = new User({
      name: "Admin",
      email,
      password: hashed,
      role: "admin"
    });

    await user.save();
    console.log("Admin created successfully in users collection!");

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }  
}

createAdmin();
