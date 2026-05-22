const { sequelize } = require('../models');

async function checkSchema() {
    try {
        await sequelize.authenticate();

        const tables = ['Businesses', 'SubBusinessMessages', 'Threads', 'Tasks']; // SubBusinessMessages might be the table name for BusinessMessage? Need to check.
        // Actually, let's check table names first or blindly try common ones.
        // Based on previous logs, BusinessPost table is 'business_posts'.
        // Business table is 'Businesses'.

        // Let's get all table names first.
        const [allTables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table';");
        console.log('All Tables:', allTables.map(t => t.name));

        const targetTables = ['Businesses', 'business_messages', 'BusinessMessages', 'Threads', 'threads'];

        for (const table of targetTables) {
            // Check if strict match in allTables first to avoid error
            const exists = allTables.find(t => t.name.toLowerCase() === table.toLowerCase());
            if (exists) {
                const [cols] = await sequelize.query(`PRAGMA table_info(${exists.name});`);
                const colNames = cols.map(c => c.name);
                console.log(`\nColumns for ${exists.name}:`, JSON.stringify(colNames));
                const fs = require('fs');
                fs.appendFileSync('schema_output.txt', `\nTable: ${exists.name}\nColumns: ${JSON.stringify(colNames)}\n`);
            }
        }

    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
