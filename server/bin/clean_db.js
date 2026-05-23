const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run("DELETE FROM news", (err) => {
        if (err) console.error(err);
        else console.log('Cleaned DB: Removed all news items.');
        db.close();
    });
});
