const { sequelize, Business } = require('../models');

const deleteBusiness = async () => {
    const name = process.argv[2];

    if (!name) {
        console.error('Please provide a business name.');
        console.log('Usage: node scripts/delete_business.js <business_name>');
        process.exit(1);
    }

    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const business = await Business.findOne({ where: { name } });

        if (!business) {
            console.error(`Business with name "${name}" not found.`);
            process.exit(1);
        }

        await business.destroy();
        console.log(`Successfully deleted business "${name}".`);
    } catch (error) {
        console.error('Error deleting business:', error);
    } finally {
        await sequelize.close();
    }
};

deleteBusiness();
