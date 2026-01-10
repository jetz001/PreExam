const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false
});

async function run() {
    try {
        const [results] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table';");
        console.log("Existing Tables:", results.map(r => r.name));

        // Try adding column blindly to 'users' if found
        if (results.find(r => r.name === 'users' || r.name === 'Users')) {
            console.log("Found users table. Attempting migration...");
            const table = results.find(r => r.name === 'users' || r.name === 'Users').name;
            try { await sequelize.query(`ALTER TABLE ${table} ADD COLUMN target_exam TEXT;`); } catch (e) { }
            try { await sequelize.query(`ALTER TABLE ${table} ADD COLUMN target_exam_date DATETIME;`); } catch (e) { }
            console.log("Migration steps executed.");
        }
    } catch (error) {
        console.error("DB Error:", error);
    }
}

run();
