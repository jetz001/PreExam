const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require(path.resolve(__dirname, 'config', 'firebase-service-account.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function test() {
  const snapshot = await db.collection('threads').orderBy('created_at', 'desc').get();
  console.log("Total docs:", snapshot.docs.length);
  snapshot.docs.forEach(doc => {
    console.log("Doc:", doc.id, doc.data().title);
  });
}
test().catch(console.error);
