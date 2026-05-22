const sqlite3 = require('sqlite3').verbose();
const { db: firestore } = require('./config/firebase');

async function migrate() {
    const backupPath = 'D:/DEV/PreExam/Bin/temp/backup-2026-05-03_0300/temp.sqlite';
    const db = new sqlite3.Database(backupPath);

    console.log('Migrating threads and bookmarks to Firebase...');
    
    // Migrate Bookmarks
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='UserBookmarks';", [], (err, tables) => {
        if (tables.length > 0) {
            db.all('SELECT * FROM UserBookmarks', async (err, rows) => {
                if (err) return console.log(err);
                const batch = firestore.batch();
                let count = 0;
                for (const row of rows) {
                    const docRef = firestore.collection('bookmarks').doc(row.id.toString());
                    batch.set(docRef, { ...row, id: row.id.toString(), user_id: row.user_id.toString() }, { merge: true });
                    count++;
                }
                if (count > 0) await batch.commit();
                console.log(`Migrated ${count} bookmarks.`);
            });
        }
    });

    // Migrate Threads
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='threads';", [], (err, tables) => {
        if (tables.length > 0) {
            db.all('SELECT * FROM threads', async (err, rows) => {
                if (err) return console.log(err);
                const batch = firestore.batch();
                let count = 0;
                for (const row of rows) {
                    const docRef = firestore.collection('threads').doc(row.id.toString());
                    // Try to parse tags if they are JSON
                    let tags = [];
                    try { if (row.tags) tags = JSON.parse(row.tags); } catch(e){}
                    batch.set(docRef, { 
                        ...row, 
                        id: row.id.toString(), 
                        user_id: row.user_id.toString(),
                        tags: tags
                    }, { merge: true });
                    count++;
                }
                if (count > 0) await batch.commit();
                console.log(`Migrated ${count} threads.`);
            });
        }
    });
}

migrate();
