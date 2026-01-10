const { sequelize, Transaction } = require('../models');

async function resetSchema() {
    try {
        console.log('Resetting Transactions Table Override...');

        // This will DROP the table and CREATE it again based on the Model definition
        await Transaction.sync({ force: true });

        console.log('Transactions table recreated successfully with new schema (UUID, etc).');
        process.exit(0);
    } catch (error) {
        console.error('Schema reset failed:', error);
        process.exit(1);
    }
}

resetSchema();
