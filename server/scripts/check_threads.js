const { Thread, User, InterestTag, SearchLog, Sequelize } = require('../models');
const { Op } = require('sequelize');
const db = require('../models');

async function checkThreads() {
    try {
        console.log('Simulating getThreads...');
        const limit = 10;
        const whereClause = {};

        const threads = await Thread.findAll({
            where: whereClause,
            limit: parseInt(limit),
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: User,
                    attributes: ['id', 'display_name', 'avatar', 'plan_type'],
                    include: [{ model: db.Business, as: 'MyBusiness', attributes: ['id', 'name', 'is_verified'] }]
                },
                { model: InterestTag, through: { attributes: [] } },
                { model: db.Comment, attributes: ['id'] },
                {
                    model: db.Poll,
                    include: [{ model: db.PollOption, as: 'Options' }]
                },
                { model: db.News, as: 'SharedNews' },
                { model: db.BusinessPost, as: 'SharedBusinessPost', include: [{ model: db.Business, as: 'Business' }] }
            ],
        });

        console.log(`Threads retrieved: ${threads.length}`);

        // Simulate Processing Logic
        const userId = null;
        console.log('User ID is null (Guest)');

        const threadsWithLiked = await Promise.all(threads.map(async t => {
            const threadJson = t.toJSON();
            if (userId) {
                // ...
            } else {
                threadJson.isLiked = false;
            }
            if (threadJson.Poll) {
                threadJson.Poll.isVoted = false;
            }
            return threadJson;
        }));

        console.log('Processed threads successfully');

    } catch (error) {
        console.error('ERROR in checkThreads:', error);
    }
}

checkThreads();
