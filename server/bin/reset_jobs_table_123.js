const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database.sqlite');
console.log('Connecting to ' + dbPath);
const db = new sqlite3.Database(dbPath);
db.serialize(() => {
    db.run("DELETE FROM news", (err) => {
        if (err) console.error("Error from news:", err);
        else console.log('Cleaned DB: Removed all news items / jobs records.');

        db.run('DELETE FROM jobs', (err2) => {
            if (err2) console.log("Jobs table may not exist, moving on.", err2.message);
            else console.log("Removed all items from jobs.");
            db.close();
        });
    });
});
