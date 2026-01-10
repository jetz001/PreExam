const cron = require('node-cron');
const db = require('../models');
const { User } = db;
const Op = db.Sequelize.Op;

const initCronJobs = () => {
    // Check for expired subscriptions every day at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily subscription check...');
        try {
            const today = new Date();

            // Find users who are premium but expired
            const expiredUsers = await User.findAll({
                where: {
                    plan_type: 'premium',
                    premium_expiry: {
                        [Op.lt]: today
                    }
                }
            });

            if (expiredUsers.length > 0) {
                console.log(`Found ${expiredUsers.length} expired subscriptions.`);

                for (const user of expiredUsers) {
                    user.plan_type = 'free';
                    user.premium_expiry = null;
                    await user.save();
                    console.log(`Downgraded user ${user.id} to free plan.`);

                    // TODO: Send notification to user
                }
            } else {
                console.log('No expired subscriptions found.');
            }

        } catch (error) {
            console.error('Error in cron job:', error);
        }
    });
};

module.exports = initCronJobs;
