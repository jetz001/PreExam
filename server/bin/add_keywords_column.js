const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run("ALTER TABLE news ADD COLUMN keywords TEXT", (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Column "keywords" already exists.');
            } else {
                console.error('Error adding column:', err.message);
            }
        } else {
            console.log('Column "keywords" added successfully.');
        }
    });
});

db.close();
