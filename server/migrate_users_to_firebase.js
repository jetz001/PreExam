const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { User } = require('./firebaseModels');

async function migrate() {
    const backupPath = 'D:/DEV/PreExam/Bin/temp/backup-2026-05-03_0300/temp.sqlite';
    const db = new sqlite3.Database(backupPath);

    console.log('Reading from SQLite backup...');
    
    db.all('SELECT * FROM Users', async (err, rows) => {
        if (err) {
            console.error('Error reading Users:', err.message);
            process.exit(1);
        }
        
        console.log(`Found ${rows.length} users. Migrating to Firebase...`);
        let successCount = 0;
        
        for (const row of rows) {
            try {
                // Check if user already exists by email
                const existing = await User.findOne({ where: { email: row.email } });
                if (!existing) {
                    await User.create({
                        ...row,
                        // Avoid id conflict if string ids are used in firebase
                        id: row.id.toString(), 
                        created_at: row.created_at || new Date().toISOString()
                    });
                    successCount++;
                }
            } catch (e) {
                console.error(`Failed to migrate user ${row.email}:`, e.message);
            }
        }
        
        console.log(`Migration complete! Successfully added ${successCount} new users to Firebase.`);
        process.exit(0);
    });
}

migrate();
