const fs = require('fs');
const path = require('path');

const FIREBASE_SDK_PATH = path.join(__dirname, '..', 'firebase-adminsdk.json');

// Load Firebase JSON safely
const loadFirebaseSdk = () => {
  try {
    if (!fs.existsSync(FIREBASE_SDK_PATH)) {
      console.error(`❌ firebase-adminsdk.json NOT FOUND at: ${FIREBASE_SDK_PATH}`);
      return {};
    }

    const jsonData = fs.readFileSync(FIREBASE_SDK_PATH, 'utf8');
    const parsed = JSON.parse(jsonData);

    return {
      projectId: parsed.projectId || parsed.project_id,
      clientEmail: parsed.clientEmail || parsed.client_email,
      privateKey: parsed.privateKey?.replace(/\\n/g, '\n') || parsed.private_key?.replace(/\\n/g, '\n'),
    };
  } catch (error) {
    console.error("❌ Failed to load firebase-adminsdk.json:", error.message);
    return {};
  }
};

const firebaseSdk = loadFirebaseSdk();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/zip_shift',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  SOCKET_CLIENT_ORIGIN: process.env.SOCKET_CLIENT_ORIGIN || process.env.FRONTEND_URL,

  // Firebase from file only
  FIREBASE_PROJECT_ID: firebaseSdk.projectId,
  FIREBASE_CLIENT_EMAIL: firebaseSdk.clientEmail,
  FIREBASE_PRIVATE_KEY: firebaseSdk.privateKey,

  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS
};
