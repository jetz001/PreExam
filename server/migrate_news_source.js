const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, './database.sqlite'); // Adjust if needed
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Create news_sources table
    db.run(`CREATE TABLE IF NOT EXISTS news_sources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error('Error creating news_sources table:', err.message);
        } else {
            console.log('news_sources table created successfully.');
        }
    });
});

db.close();
