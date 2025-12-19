// scripts/checkAdminInUsers.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: process.env.MONGODB_DBNAME || undefined
    });
    const admins = await mongoose.connection.db.collection('users').find({ role: 'admin' }).toArray();
    console.log('Admins found:', admins.length);
    console.log(admins.map(a => ({ _id: a._id, email: a.email, name: a.name, passwordLength: a.password ? a.password.length : 0 })));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
