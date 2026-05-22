const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('D:/DEV/PreExam/Bin/temp/backup-2026-05-03_0300/temp.sqlite');

db.serialize(() => {
  db.all("SELECT name FROM sqlite_master WHERE type='table';", (err, tables) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Tables:', tables.map(t => t.name));
    }
    db.close();
  });
});
