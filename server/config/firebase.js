const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccountPath = path.resolve(__dirname, 'firebase-service-account.json');

try {
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('Firebase Admin initialized successfully.');
} catch (error) {
  console.error('Failed to initialize Firebase Admin via cert, using mock projectId:', error.message);
  admin.initializeApp({ projectId: 'demo-preexam' });
}

const db = admin.firestore();

module.exports = { admin, db };
