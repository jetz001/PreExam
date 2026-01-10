const { Sequelize } = require('sequelize');
const path = require('path');

// Target the ROOT database.sqlite
// __dirname is server/scripts
const dbPath = path.join(__dirname, '../../database.sqlite');
console.log("Targeting Database:", dbPath);

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false
});

async function run() {
    try {
        const [results] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table';");
        const tables = results.map(r => r.name);
        console.log("Tables found:", tables);

        if (tables.includes('users') || tables.includes('Users')) {
            const table = tables.includes('users') ? 'users' : 'Users';
            console.log(`Migrating table: ${table}`);

            const columnsToAdd = [
                { name: 'target_exam', type: 'TEXT' },
                { name: 'target_exam_date', type: 'DATETIME' },
                { name: 'font_size_preference', type: 'TEXT' }
            ];

            for (const col of columnsToAdd) {
                try {
                    await sequelize.query(`ALTER TABLE ${table} ADD COLUMN ${col.name} ${col.type};`);
                    console.log(`Added ${col.name}`);
                } catch (e) {
                    if (e.message.includes('duplicate column')) {
                        console.log(`${col.name} already exists.`);
                    } else {
                        console.error(`Error adding ${col.name}:`, e.message);
                    }
                }
            }
        } else {
            console.error("Users table NOT FOUND in root DB!");
        }

    } catch (error) {
        console.error("Migration Error:", error);
    }
}

run();
