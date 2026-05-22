const sqlite3 = require('sqlite3').verbose();
const { db } = require('../config/firebase');

const dbPath = 'D:\\DEV\\PreExam\\Bin\\temp\\backup-2026-05-03_0300\\temp.sqlite';
const sqliteDb = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error opening db:', err.message);
        process.exit(1);
    }
});

console.log('Starting user migration from SQLite to Firebase...');

sqliteDb.all("SELECT * FROM users", [], async (err, rows) => {
    if (err) {
        console.error('Error reading users:', err.message);
        return;
    }
    
    console.log(`Found ${rows.length} users. Migrating to Firebase...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    const collection = db.collection('users');
    let batchCount = 0;
    let currentBatch = db.batch();
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        // Parse JSON fields safely
        try {
            if (row.mistake_history && typeof row.mistake_history === 'string') row.mistake_history = JSON.parse(row.mistake_history);
            if (row.business_info && typeof row.business_info === 'string') row.business_info = JSON.parse(row.business_info);
            if (row.admin_permissions && typeof row.admin_permissions === 'string') row.admin_permissions = JSON.parse(row.admin_permissions);
        } catch (e) {
            // Ignore parse errors, keep as string
        }
        
        const docRef = collection.doc(row.id.toString());
        currentBatch.set(docRef, row, { merge: true });
        successCount++;
        batchCount++;
        
        if (batchCount >= 400 || i === rows.length - 1) {
            try {
                await currentBatch.commit();
                console.log(`Committed batch of ${batchCount} users`);
                currentBatch = db.batch();
                batchCount = 0;
            } catch (error) {
                console.error('Error committing batch:', error);
                errorCount += batchCount;
            }
        }
    }
    
    console.log(`Migration complete. Success: ${successCount}, Errors: ${errorCount}`);
    process.exit(0);
});
