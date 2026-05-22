
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Checking schema for exam_results...');
    db.all("PRAGMA table_info(exam_results)", (err, rows) => {
        if (err) {
            console.error('Error fetching table info:', err);
        } else {
            console.log('Columns:', rows.map(r => r.name).join(', '));
            const hasQuestions = rows.some(r => r.name === 'questions');
            console.log('Has questions column:', hasQuestions);
        }
    });
});

db.close();
