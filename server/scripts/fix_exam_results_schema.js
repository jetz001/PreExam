
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('--- Migration Start ---');
    db.all("PRAGMA table_info(exam_results)", (err, rows) => {
        if (err) {
            console.error('Error reading schema:', err);
            db.close();
            return;
        }

        const names = rows.map(r => r.name);
        console.log('Existing columns:', names);

        if (names.includes('questions')) {
            console.log('Column "questions" already exists. No action needed.');
            db.close();
        } else {
            console.log('Column "questions" missing. Attempting to add...');
            db.run("ALTER TABLE exam_results ADD COLUMN questions TEXT", (alterErr) => {
                if (alterErr) {
                    console.error('FAILED to add column:', alterErr);
                } else {
                    console.log('SUCCESS: Column "questions" added.');
                }
                db.close();
            });
        }
    });
});
