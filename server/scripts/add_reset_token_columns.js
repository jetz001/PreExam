const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Logic to find the correct DB based on analysis:
// server/config/database.js uses '../../database.sqlite' (relative to config/)
// So from scripts/ it should be '../../database.sqlite'
const dbPath = path.resolve(__dirname, '../../database.sqlite');
console.log('Connecting to DB at:', dbPath);

const db = new sqlite3.Database(dbPath);

const addColumns = () => {
    db.serialize(() => {
        // Check if table exists first
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Users'", (err, row) => {
            if (err) {
                console.error('Error checking table:', err);
                return;
            }
            // Sequelize often uses plural 'Users' but sqlite might have it as passed. 
            // Model says tableName: 'users', verify if it's 'users' or 'Users'
            const tableName = row ? 'Users' : 'users'; // Try to be smart? NO, let's just use what we find.

            // Actually, let's just query to see which one exists.
            db.all("SELECT name FROM sqlite_master WHERE type='table' AND (name='users' OR name='Users')", (err, rows) => {
                if (err) {
                    console.error(err);
                    return;
                }
                if (rows.length === 0) {
                    console.error("Table 'users' or 'Users' NOT FOUND in this DB.");
                    console.log("Tables found:", rows);
                    return;
                }
                const actualTableName = rows[0].name;
                console.log(`Found table: ${actualTableName}`);

                // Add Columns
                const columns = ['reset_password_token', 'reset_password_expires'];
                const types = ['TEXT', 'INTEGER'];

                columns.forEach((col, idx) => {
                    db.run(`ALTER TABLE ${actualTableName} ADD COLUMN ${col} ${types[idx]}`, (err) => {
                        if (err && err.message.includes('duplicate column name')) {
                            console.log(`Column ${col} already exists.`);
                        } else if (err) {
                            console.error(`Error adding ${col}:`, err.message);
                        } else {
                            console.log(`Added column: ${col}`);
                        }
                    });
                });
            });
        });
    });
};

addColumns();
