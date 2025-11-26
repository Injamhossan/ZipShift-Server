require('dotenv').config();
const { getFirebaseAdmin } = require('./services/firebaseAdmin');

try {
  console.log('Attempting to initialize Firebase Admin...');
  const admin = getFirebaseAdmin();
  
  if (admin) {
    console.log('✅ Firebase Admin initialized successfully.');
    console.log('Project ID:', admin.app().options.credential.projectId);
    console.log('Service Account Email:', admin.app().options.credential.clientEmail);
  } else {
    console.error('❌ Failed to initialize Firebase Admin (returned null).');
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error);
}
