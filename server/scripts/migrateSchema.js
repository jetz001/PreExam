const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false,
    retry: {
        max: 5
    }
});

async function addColumn(colName, colType) {
    try {
        await sequelize.query(`ALTER TABLE users ADD COLUMN ${colName} ${colType};`);
        console.log(`SUCCESS: Added ${colName}`);
    } catch (error) {
        if (error.message.includes('duplicate column')) {
            console.log(`INFO: Column ${colName} already exists.`);
        } else {
            console.error(`ERROR adding ${colName}:`, error.message);
        }
    }
}

async function run() {
    console.log("Starting schema migration...");
    await addColumn('target_exam', 'TEXT');
    await addColumn('target_exam_date', 'DATETIME');
    await addColumn('font_size_preference', 'TEXT'); // Ensuring this exists too from previous tasks
    console.log("Migration finished.");
}

run();
