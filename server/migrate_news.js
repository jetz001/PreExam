const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

const columnsToAdd = [
    { name: 'summary', type: 'TEXT' },
    { name: 'category', type: 'TEXT' },
    { name: 'image_url', type: 'TEXT' },
    { name: 'external_link', type: 'TEXT' },
    { name: 'pdf_url', type: 'TEXT' },
    { name: 'product_link', type: 'TEXT' },
    { name: 'views', type: 'INTEGER DEFAULT 0' }
];

db.serialize(() => {
    columnsToAdd.forEach(col => {
        const query = `ALTER TABLE news ADD COLUMN ${col.name} ${col.type};`;
        db.run(query, (err) => {
            if (err) {
                if (err.message.includes('duplicate column name')) {
                    console.log(`Column ${col.name} already exists.`);
                } else {
                    console.error(`Error adding column ${col.name}:`, err.message);
                }
            } else {
                console.log(`Added column ${col.name}`);
            }
        });
    });
});

db.close();
