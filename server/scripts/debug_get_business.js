const { Business, sequelize } = require('../models');
const { Op } = require('sequelize');

async function debugGetAllBusinesses() {
    try {
        console.log('Authenticating DB...');
        await sequelize.authenticate();
        console.log('DB Connection OK.');

        console.log('Fetching all businesses...');
        // Mimic the query in getAllBusinesses
        const businesses = await Business.findAll({
            where: {},
            limit: 50,
            order: [['created_at', 'DESC']] // Validating if this works
        });

        console.log('Query Successful!');
        console.log(`Found ${businesses.length} businesses.`);
    } catch (error) {
        console.error('---------------------------------------------------');
        console.error('CRITICAL ERROR CAUGHT:');
        const fs = require('fs');
        const errorLog = `Message: ${error.message}\nStack: ${error.stack}\nFull: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`;
        console.error(errorLog);
        fs.writeFileSync('debug_get_business_output.txt', errorLog);
        console.error('---------------------------------------------------');
    } finally {
        await sequelize.close();
    }
}

debugGetAllBusinesses();
