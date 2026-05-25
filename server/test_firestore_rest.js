const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require(path.resolve(__dirname, 'config', 'firebase-service-account.json'));
const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');

async function testREST() {
  const auth = new GoogleAuth({
    credentials: {
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key,
    },
    scopes: ['https://www.googleapis.com/auth/datastore'],
  });
  
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  try {
    const res = await axios.post(
      `https://firestore.googleapis.com/v1/projects/${serviceAccount.project_id}/databases/(default)/documents:runQuery`,
      {
        structuredQuery: {
          from: [{ collectionId: "threads" }],
          orderBy: [{ field: { fieldPath: "created_at" }, direction: "DESCENDING" }],
          limit: 10
        }
      },
      {
        headers: { Authorization: `Bearer ${token.token}` }
      }
    );
    console.log("Status:", res.status);
    console.log("Data:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

testREST();
