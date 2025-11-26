// Environment variables
//
// Note: dotenv is loaded in server.js before this file is required
// This ensures .env variables are available here

const fs = require('fs');
const path = require('path');

const DEFAULT_FIREBASE_SDK_PATH = path.join(__dirname, '..', 'firebase-adminsdk.json');

const parseFirebaseSdk = () => {
  const inline = process.env.FIREBASE_SDK || process.env.firebase_SDK;
  if (inline) {
    try {
      const parsed = JSON.parse(inline);
      return {
        projectId: parsed.projectId || parsed.project_id,
        clientEmail: parsed.clientEmail || parsed.client_email,
        privateKey: parsed.privateKey || parsed.private_key
      };
    } catch (error) {
      console.warn('⚠️  Failed to parse inline FIREBASE_SDK JSON. Will try file path.', error.message);
    }
  }

  const sdkPath = process.env.FIREBASE_SDK_PATH || DEFAULT_FIREBASE_SDK_PATH;
  if (sdkPath) {
    try {
      if (fs.existsSync(sdkPath)) {
        const fileContents = fs.readFileSync(sdkPath, 'utf8');
        const parsed = JSON.parse(fileContents);
        return {
          projectId: parsed.projectId || parsed.project_id,
          clientEmail: parsed.clientEmail || parsed.client_email,
          privateKey: parsed.privateKey || parsed.private_key
        };
      } else {
        console.warn(`⚠️  FIREBASE_SDK file not found at ${sdkPath}`);
      }
    } catch (error) {
      console.warn('⚠️  Failed to parse FIREBASE_SDK JSON file.', error.message);
    }
  }

  return {};
};

const firebaseSdk = parseFirebaseSdk();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/zip_shift',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  SOCKET_CLIENT_ORIGIN: process.env.SOCKET_CLIENT_ORIGIN || process.env.FRONTEND_URL,
  FIREBASE_PROJECT_ID: firebaseSdk.projectId || process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: firebaseSdk.clientEmail || process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: (firebaseSdk.privateKey || process.env.FIREBASE_PRIVATE_KEY)?.replace(/\\n/g, '\n'),
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS
};
