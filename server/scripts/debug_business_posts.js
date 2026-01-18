const { BusinessPost, Business, sequelize } = require('../models');

async function debugPosts() {
    try {
        console.log('Authenticating DB...');
        await sequelize.authenticate();
        console.log('DB Connection OK.');

        const business_id = 3; // The ID failing in user report
        console.log(`Fetching posts for business_id: ${business_id}...`);

        const posts = await BusinessPost.findAndCountAll({
            where: { business_id },
            limit: 20,
            offset: 0,
            order: [
                ['is_pinned', 'DESC'],
                ['createdAt', 'DESC']
            ],
            include: [
                { model: Business, as: 'Business', attributes: ['name', 'logo_image', 'id'] }
            ]
        });

        console.log('Query Successful!');
        console.log(`Found ${posts.count} posts.`);
    } catch (error) {
        console.error('---------------------------------------------------');
        console.error('CRITICAL ERROR CAUGHT:');
        const fs = require('fs');
        const errorLog = `Message: ${error.message}\nStack: ${error.stack}\nFull: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`;
        fs.writeFileSync('debug_output.txt', errorLog);
        console.log('Error written to debug_output.txt');
        console.error('---------------------------------------------------');
    } finally {
        await sequelize.close();
    }
}

debugPosts();
