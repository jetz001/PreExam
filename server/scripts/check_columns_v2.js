const { sequelize } = require('../models');

async function checkSchema() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("PRAGMA table_info(Businesses);");
        console.log('Columns for Businesses:', results.map(c => c.name));

        const [postResults] = await sequelize.query("PRAGMA table_info(business_posts);");
        console.log('Columns for business_posts:', postResults.map(c => c.name));
    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
