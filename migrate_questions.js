const sqlite3 = require('sqlite3').verbose();
const { db } = require('./server/config/firebase');

const sqliteDb = new sqlite3.Database('D:/DEV/PreExam/Bin/temp/backup-2026-05-03_0300/temp.sqlite');

sqliteDb.serialize(() => {
  sqliteDb.all("SELECT * FROM questions", async (err, rows) => {
    if (err) {
      console.error("Error reading from SQLite:", err);
      process.exit(1);
    }
    
    console.log(`Found ${rows.length} questions in SQLite.`);
    
    if (rows.length === 0) {
      console.log('No questions to migrate.');
      process.exit(0);
    }

    try {
      const batchSize = 400; // Firestore limit is 500 per batch
      let currentBatch = db.batch();
      let operationCount = 0;
      let totalMigrated = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        // Parse JSON fields if they are strings
        if (typeof row.options === 'string') {
          try { row.options = JSON.parse(row.options); } catch (e) {}
        }
        if (typeof row.explanation === 'string' && row.explanation.startsWith('{')) {
           // explanation might just be a string, let's leave it as is unless it's JSON array
        }

        const docRef = db.collection('questions').doc(row.id ? row.id.toString() : `q_${i}`);
        
        // ensure no undefined values are sent to Firestore
        const cleanData = {};
        for (const [key, value] of Object.entries(row)) {
          if (value !== undefined) {
            cleanData[key] = value;
          }
        }
        
        currentBatch.set(docRef, cleanData);
        operationCount++;

        if (operationCount >= batchSize) {
          await currentBatch.commit();
          totalMigrated += operationCount;
          console.log(`Committed ${totalMigrated} questions...`);
          currentBatch = db.batch(); // Create new batch
          operationCount = 0;
        }
      }

      if (operationCount > 0) {
        await currentBatch.commit();
        totalMigrated += operationCount;
        console.log(`Committed final batch. Total migrated: ${totalMigrated}`);
      }
      
      console.log('Migration of questions completed successfully!');
    } catch (e) {
      console.error('Error migrating to Firebase:', e);
    } finally {
      sqliteDb.close();
      process.exit(0);
    }
  });
});
