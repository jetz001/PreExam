const { sequelize } = require('./models');

async function listTables() {
    try {
        const [results] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table';");
        console.log('TABLES:', results.map(r => r.name).join(', '));
        process.exit(0);
    } catch (error) {
        console.error('List failed:', error);
        process.exit(1);
    }
}

listTables();
