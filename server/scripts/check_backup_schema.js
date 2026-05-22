const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = 'D:\\DEV\\PreExam\\Bin\\temp\\backup-2026-05-03_0300\\temp.sqlite';
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error opening db:', err.message);
        process.exit(1);
    }
});

db.serialize(() => {
    db.all("SELECT name FROM sqlite_master WHERE type='table';", [], (err, tables) => {
        if (err) {
            console.error('Error getting tables:', err.message);
            return;
        }
        console.log('Tables:', tables.map(t => t.name).join(', '));
        
        db.all("PRAGMA table_info('users');", [], (err, columns) => {
            if (err) {
                console.error('Error getting columns for users:', err.message);
            } else {
                console.log('Columns in users:', columns.map(c => `${c.name} (${c.type})`).join(', '));
            }
            
            db.all("SELECT * FROM users LIMIT 1;", [], (err, rows) => {
                if (err) {
                    console.error('Error getting sample user:', err.message);
                } else {
                    console.log('Sample user:', rows[0]);
                }
                db.close();
            });
        });
    });
});
