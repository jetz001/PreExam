const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
try {
  let serviceAccount;
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Attempt to parse the JSON from environment variable (useful for production/Cloudflare)
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Fallback to local file
    const serviceAccountPath = path.resolve(__dirname, 'firebase-service-account.json');
    serviceAccount = require(serviceAccountPath);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('Firebase Admin initialized successfully.');
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error.message);
  // Do not fallback to mock project blindly; let it fail so we can catch it or fallback gracefully
  admin.initializeApp({ projectId: 'demo-preexam' });
}

const db = admin.firestore();

module.exports = { admin, db };
