const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false
});

async function checkSchema() {
    try {
        const [results] = await sequelize.query("PRAGMA table_info(Users);");
        console.log("Columns in Users table:");
        results.forEach(col => console.log(`- ${col.name} (${col.type})`));
    } catch (error) {
        console.error("Error:", error);
    }
}

checkSchema();
