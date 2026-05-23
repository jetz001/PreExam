const { sequelize } = require('./models');

async function sync() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        await sequelize.sync({ alter: true });
        console.log('Database synced (alter: true).');
        process.exit(0);
    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
}

sync();
