const { Thread, BusinessMessage, User, Business, sequelize } = require('../models');

async function debugQueries() {
    try {
        console.log('Authenticating...');
        await sequelize.authenticate();

        console.log('--- Debugging getThreads ---');
        try {
            const threads = await Thread.findAll({
                limit: 5,
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: User,
                        attributes: ['id', 'display_name', 'avatar', 'plan_type'],
                        include: [{ model: Business, as: 'MyBusiness', attributes: ['id', 'name', 'is_verified'] }]
                    }
                ]
            });
            console.log(`getThreads Success: Found ${threads.length} threads`);
            const fs = require('fs');
            fs.writeFileSync('success_threads.txt', 'OK');
        } catch (err) {
            console.error('getThreads FAILED:', err.message);
            const fs = require('fs');
            fs.writeFileSync('debug_threads_error.txt', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        }

        console.log('\n--- Debugging getInbox ---');
        try {
            // Need a business ID first
            const business = await Business.findOne();
            if (business) {
                console.log(`Using Business ID: ${business.id}`);
                const messages = await BusinessMessage.findAll({
                    where: { business_id: business.id },
                    order: [['created_at', 'DESC']],
                    include: [
                        { model: User, as: 'User', attributes: ['id', 'display_name', 'avatar'] }
                    ]
                });
                console.log(`getInbox Success: Found ${messages.length} messages`);
                const fs = require('fs');
                fs.writeFileSync('success_inbox.txt', 'OK');
            } else {
                console.log('No business found to test inbox');
                fs.writeFileSync('success_inbox.txt', 'SKIPPED_NO_BUSINESS');
            }
        } catch (err) {
            console.error('getInbox FAILED:', err.message);
            const fs = require('fs');
            fs.writeFileSync('debug_inbox_error.txt', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        }

    } catch (error) {
        console.error('General Error:', error);
    } finally {
        await sequelize.close();
    }
}

debugQueries();
