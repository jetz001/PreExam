const sqlite3 = require('sqlite3').verbose();
const { ExamResult, Business, Question } = require('./firebaseModels');

async function migrate() {
    const backupPath = 'D:/DEV/PreExam/Bin/temp/backup-2026-05-03_0300/temp.sqlite';
    const db = new sqlite3.Database(backupPath);

    console.log('Migrating ExamHistory/exam_results to Firebase...');
    
    // Attempt to migrate exam_results
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='exam_results';", [], (err, tables) => {
        if (tables && tables.length > 0) {
            db.all('SELECT * FROM exam_results', async (err, rows) => {
                if (err) return console.log(err);
                console.log(`Found ${rows.length} exam_results. Migrating...`);
                let count = 0;
                for (const row of rows) {
                    try {
                        const existing = await ExamResult.findOne({ where: { id: row.id.toString() } });
                        if (!existing) {
                            await ExamResult.create({ ...row, id: row.id.toString() });
                            count++;
                        }
                    } catch (e) {
                        console.error('Failed to migrate exam_result:', e.message);
                    }
                }
                console.log(`Successfully migrated ${count} exam_results to Firebase!`);
                process.exit(0);
            });
        } else {
            // Wait, what if the table is named ExamResults?
            db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%exam%';", [], (err, tables2) => {
                console.log('Available exam-related tables in backup:', tables2);
                
                // Also check settings table
                db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%setting%';", [], (err, settingsTables) => {
                    console.log('Available settings tables:', settingsTables);
                    process.exit(0);
                });
            });
        }
    });
}

migrate();
