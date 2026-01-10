
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Adding questions column to exam_results table...');
    db.run("ALTER TABLE exam_results ADD COLUMN questions TEXT", (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Column already exists.');
            } else {
                console.error('Error adding column:', err);
            }
        } else {
            console.log('Column added successfully.');
        }
    });
});

db.close();
