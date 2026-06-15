require('dotenv').config();
const { db } = require('./config/firebase');

async function run() {
    const snapshot = await db.collection('room_assets').get();
    let count = 0;
    snapshot.forEach(doc => {
        console.log(`Asset ID: ${doc.id}, Name: ${doc.data().name}, Type: ${doc.data().type}`);
        count++;
    });
    console.log(`Total assets: ${count}`);
}

run().then(() => process.exit(0)).catch(console.error);
