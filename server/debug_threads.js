const { Thread, User, InterestTag, ThreadTag, SearchLog } = require('./models');
const db = require('./models');
const { Op } = require('sequelize');

async function debugThreads() {
    try {
        console.log("Starting debug thread fetch...");

        // 1. Ensure a user exists
        let user = await User.findOne();
        if (!user) {
            console.log("Creating dummy user...");
            user = await User.create({
                email: 'test@example.com',
                display_name: 'TestUser',
                password_hash: 'hash',
                role: 'user'
            });
        }

        // 2. Ensure a thread exists
        let thread = await Thread.findOne();
        if (!thread) {
            console.log("Creating dummy thread...");
            thread = await Thread.create({
                user_id: user.id,
                title: 'Test Thread',
                content: 'Content',
                category: 'General'
            });
        }

        console.log("Found/Created User ID:", user.id);
        console.log("Found/Created Thread ID:", thread.id);

        // 3. Run Controller Logic
        const limit = 10;
        const whereClause = {};

        console.log("Executing findAll...");
        const threads = await Thread.findAll({
            where: whereClause,
            limit: parseInt(limit),
            order: [['created_at', 'DESC']],
            include: [
                { model: User, attributes: ['id', 'display_name', 'avatar', 'plan_type'] },
                { model: InterestTag, through: { attributes: [] } },
                { model: db.Comment, attributes: ['id'] },
                {
                    model: db.Poll,
                    include: [{ model: db.PollOption, as: 'Options' }]
                },
            ],
        });

        console.log(`Successfully fetched ${threads.length} threads.`);

        // 4. Run Map Logic (Simulate logged in user)
        const userId = user.id;
        console.log("Executing map (ThreadLike check)...");

        const threadsWithLiked = await Promise.all(threads.map(async t => {
            const threadJson = t.toJSON();
            if (userId) {
                // This is the suspect line
                if (!db.ThreadLike) {
                    throw new Error("db.ThreadLike is undefined!");
                }
                const like = await db.ThreadLike.findOne({ where: { user_id: userId, thread_id: t.id } });
                threadJson.isLiked = !!like;
            } else {
                threadJson.isLiked = false;
            }
            return threadJson;
        }));

        console.log("Map completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("DEBUG: Detailed Error:", error);
        if (error.original) {
            console.error("Original SQL Error:", error.original);
        }
        process.exit(1);
    }
}

debugThreads();
