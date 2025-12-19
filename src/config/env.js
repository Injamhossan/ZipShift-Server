// config/firebaseCreds.js
const fs = require('fs');
const path = require('path');

const LOCAL_SDK_PATH = path.join(__dirname, '..', 'firebase-adminsdk.json');

function loadFromLocalFile() {
  try {
    if (fs.existsSync(LOCAL_SDK_PATH)) {
      const raw = fs.readFileSync(LOCAL_SDK_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to load local firebase-adminsdk.json:', err.message);
  }
  return null;
}

function loadFromBase64Env() {
  const b64 = process.env.FIREBASE_SERVICE_KEY || process.env.FIREBASE_SDK_B64;
  if (!b64) return null;
  try {
    const decoded = Buffer.from(b64, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded);
    return parsed;
  } catch (err) {
    console.warn('Failed to parse FIREBASE_SERVICE_KEY (base64):', err.message);
    return null;
  }
}

function loadFromInlineEnv() {
  const inline = process.env.FIREBASE_SDK || process.env.FIREBASE_SDK_JSON;
  if (!inline) return null;
  try {
    return JSON.parse(inline);
  } catch (err) {
    console.warn('Failed to parse inline FIREBASE_SDK JSON:', err.message);
    return null;
  }
}

const rawCred = loadFromLocalFile() || loadFromBase64Env() || loadFromInlineEnv() || {};

const FIREBASE_CREDENTIAL = {
  projectId: process.env.FIREBASE_PROJECT_ID || rawCred.project_id || rawCred.projectId,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || rawCred.client_email || rawCred.clientEmail,
  // ensure newline characters are fixed
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || rawCred.private_key || rawCred.privateKey || '').replace(/\\n/g, '\n') || undefined
};



module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/zip_shift',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  SOCKET_CLIENT_ORIGIN: process.env.SOCKET_CLIENT_ORIGIN || process.env.FRONTEND_URL,


  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,

  // Export individual fields for backward compatibility with firebaseAdmin.js
  FIREBASE_PROJECT_ID: FIREBASE_CREDENTIAL.projectId,
  FIREBASE_CLIENT_EMAIL: FIREBASE_CREDENTIAL.clientEmail,
  FIREBASE_PRIVATE_KEY: FIREBASE_CREDENTIAL.privateKey,

  FIREBASE_CREDENTIAL,
};
