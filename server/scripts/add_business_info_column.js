const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Check if column exists first
    db.all("PRAGMA table_info(users)", (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }

        const hasColumn = rows.some(row => row.name === 'business_info');

        if (!hasColumn) {
            db.run("ALTER TABLE users ADD COLUMN business_info TEXT", (err) => {
                if (err) {
                    console.error("Error adding column:", err.message);
                } else {
                    console.log("Column 'business_info' added successfully.");
                }
                db.close();
            });
        } else {
            console.log("Column 'business_info' already exists.");
            db.close();
        }
    });
});
