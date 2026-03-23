const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
console.log('Checking database at:', dbPath);
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("SELECT id, title, category FROM news ORDER BY id DESC LIMIT 10", (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log('--- Last 10 News Items ---');
            rows.forEach(row => {
                console.log(`[ID: ${row.id}] ${row.title} (${row.category})`);
            });
        }
        db.close();
    });
});
