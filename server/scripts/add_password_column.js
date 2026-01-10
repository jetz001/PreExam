const { sequelize } = require('../models');

async function addPasswordColumn() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Check if column exists first to avoid error
        const [results] = await sequelize.query("PRAGMA table_info(rooms);");
        const hasPassword = results.some(col => col.name === 'password');

        if (!hasPassword) {
            console.log('Adding password column to rooms table...');
            await sequelize.query('ALTER TABLE rooms ADD COLUMN password TEXT;');
            console.log('Password column added successfully.');
        } else {
            console.log('Password column already exists.');
        }

    } catch (error) {
        console.error('Error adding column:', error);
    } finally {
        await sequelize.close();
    }
}

addPasswordColumn();
