const { sequelize } = require('./models');

async function addEndDateColumn() {
    try {
        await sequelize.query("ALTER TABLE news ADD COLUMN end_date DATE;");
        console.log('Successfully added end_date column to news table.');
    } catch (error) {
        if (error.message.includes('duplicate column name')) {
            console.log('Column end_date already exists.');
        } else {
            console.error('Error adding end_date column:', error.message);
        }
    } finally {
        process.exit(0);
    }
}

addEndDateColumn();
