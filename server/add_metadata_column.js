const { sequelize } = require('./models');

async function migrate() {
    try {
        console.log("Adding 'metadata' column to 'news' table...");
        await sequelize.query("ALTER TABLE news ADD COLUMN metadata JSON;");
        console.log("Success: 'metadata' column added.");
    } catch (error) {
        if (error.message.includes('duplicate column name') || error.message.includes('already exists')) {
            console.log("Column 'metadata' already exists.");
        } else {
            console.error("Failed to add column:", error);
        }
    } finally {
        await sequelize.close();
    }
}

migrate();
