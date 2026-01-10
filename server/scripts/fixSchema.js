const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false
});

async function checkSchema() {
    try {
        const [results] = await sequelize.query("PRAGMA table_info(users);");
        console.log("Columns in users table:");
        results.forEach(col => console.log(`- ${col.name} (${col.type})`));

        const hasTarget = results.find(c => c.name === 'target_exam');
        const hasDate = results.find(c => c.name === 'target_exam_date');

        if (!hasDate) {
            console.log("MISSING target_exam_date column!");
            await sequelize.query("ALTER TABLE users ADD COLUMN target_exam_date DATETIME;");
            console.log("Added target_exam_date column.");
        }
        if (!hasTarget) {
            console.log("MISSING target_exam column!");
            await sequelize.query("ALTER TABLE users ADD COLUMN target_exam TEXT;");
            console.log("Added target_exam column.");
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

checkSchema();
