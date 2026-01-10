const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../database.sqlite');
console.log("Database path:", dbPath);

if (!fs.existsSync(dbPath)) {
    console.error("DATABASE FILE NOT FOUND AT:", dbPath);
    process.exit(1);
}

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false
});

async function addColumn(tableName, colName, colType) {
    try {
        await sequelize.query(`ALTER TABLE ${tableName} ADD COLUMN ${colName} ${colType};`);
        console.log(`SUCCESS: Added ${colName} to ${tableName}`);
    } catch (error) {
        if (error.message.includes('duplicate column')) {
            console.log(`INFO: Column ${colName} already exists in ${tableName}.`);
        } else if (error.message.includes('no such table')) {
            console.log(`INFO: Table ${tableName} does not exist (trying variant).`);
            throw error;
        } else {
            console.error(`ERROR adding ${colName} to ${tableName}:`, error.message);
        }
    }
}

async function run() {
    // Try both lowercase and capitalized, just in case
    const tables = ['users', 'Users'];

    for (const table of tables) {
        try {
            await addColumn(table, 'target_exam', 'TEXT');
            await addColumn(table, 'target_exam_date', 'DATETIME');
            await addColumn(table, 'font_size_preference', 'TEXT');
            console.log(`Migration attempted on ${table}`);
        } catch (e) {
            // Ignore no such table error here as we loop
        }
    }
}

run();
