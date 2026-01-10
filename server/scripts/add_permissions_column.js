const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

async function addGenericColumn() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Check if column exists (simple check by trying to select it or just try adding)
        // SQLite doesn't support IF NOT EXISTS in ADD COLUMN well in older versions, but let's try direct ADD.
        // If it fails, it usually means it exists.

        await sequelize.query("ALTER TABLE users ADD COLUMN admin_permissions TEXT DEFAULT '[]';", {
            type: QueryTypes.RAW
        });

        console.log('Column admin_permissions added successfully.');

    } catch (error) {
        if (error.message && error.message.includes('duplicate column name')) {
            console.log('Column admin_permissions already exists.');
        } else {
            console.error('Unable to add column:', error);
        }
    } finally {
        await sequelize.close();
    }
}

addGenericColumn();
