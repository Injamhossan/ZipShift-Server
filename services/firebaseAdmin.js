const admin = require('firebase-admin');
const {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY
} = require('../config/env');

let firebaseApp;

const initFirebase = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    console.warn('⚠️  Firebase credentials are missing. Firebase auth will be skipped.');
    return null;
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY
    })
  });

  return firebaseApp;
};

module.exports = {
  getFirebaseAdmin: () => {
    if (!admin.apps.length) {
      initFirebase();
    }
    return admin;
  }
};

