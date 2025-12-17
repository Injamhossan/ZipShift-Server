const admin = require('firebase-admin');
const { FIREBASE_CREDENTIAL } = require('./config/firebaseCreds');

if (!FIREBASE_CREDENTIAL.projectId || !FIREBASE_CREDENTIAL.clientEmail || !FIREBASE_CREDENTIAL.privateKey) {
  console.error('Missing Firebase credentials. Ensure local file exists or FIREBASE_SERVICE_KEY is set.');

}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: FIREBASE_CREDENTIAL.projectId,
    clientEmail: FIREBASE_CREDENTIAL.clientEmail,
    privateKey: FIREBASE_CREDENTIAL.privateKey
  }),
});

module.exports = admin;
