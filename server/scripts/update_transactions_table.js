const { sequelize } = require('../models');

async function migrate() {
    try {
        console.log('Starting Transactions Table Migration...');

        const queryInterface = sequelize.getQueryInterface();
        const table = 'transactions';

        const columnsToAdd = [
            { name: 'receipt_url', type: 'TEXT' },
            { name: 'metadata', type: 'TEXT' },
            { name: 'stripe_session_id', type: 'TEXT' },
            { name: 'business_id', type: 'INTEGER' },
            { name: 'type', type: 'TEXT' } // Just in case, though likely exists
        ];

        for (const col of columnsToAdd) {
            try {
                // Check if column exists by trying to select it 
                // Alternatively, just try to add it and catch error (e.g. duplicate column)
                // SQLite doesn't support IF NOT EXISTS in ADD COLUMN easily in all versions, 
                // but Sequelize queryInterface.describeTable helps.

                const tableInfo = await queryInterface.describeTable(table);

                if (!tableInfo[col.name]) {
                    console.log(`Adding column: ${col.name}`);
                    await sequelize.query(`ALTER TABLE ${table} ADD COLUMN ${col.name} ${col.type};`);
                } else {
                    console.log(`Column ${col.name} already exists. Skipping.`);
                }
            } catch (err) {
                console.error(`Error adding column ${col.name}:`, err.message);
            }
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
