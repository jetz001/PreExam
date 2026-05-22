const { StudyGroup, StudyGroupMember, Thread, User, InterestTag, ThreadLike, Comment, Poll, PollOption } = require('./models');
const db = require('./models');
const { Op } = require('sequelize');

async function testQueries() {
    try {
        console.log("--- TESTING GROUP QUERY ---");
        // Ensure user exists
        const user = await User.findOne();
        if (!user) throw new Error("No user found");

        const memberships = await StudyGroupMember.findAll({
            where: { user_id: user.id },
            include: [{ model: StudyGroup }]
        });
        console.log(`Group Query Success. Found ${memberships.length} memberships.`);

        console.log("--- TESTING THREAD QUERY ---");
        const limit = 10;
        const threads = await Thread.findAll({
            limit: parseInt(limit),
            order: [['created_at', 'DESC']],
            include: [
                { model: User, attributes: ['id', 'display_name', 'avatar', 'plan_type'] },
                { model: InterestTag, through: { attributes: [] } },
                { model: Comment, attributes: ['id'] },
                {
                    model: Poll,
                    include: [{ model: PollOption, as: 'Options' }]
                },
            ],
        });
        console.log(`Thread Query Success. Found ${threads.length} threads.`);

        console.log("--- TESTING THREAD LIKE LOGIC ---");
        await Promise.all(threads.map(async t => {
            const like = await ThreadLike.findOne({ where: { user_id: user.id, thread_id: t.id } });
            return !!like;
        }));
        console.log("Thread Like Logic Success.");

        process.exit(0);
    } catch (error) {
        console.error("DEBUG QUERY FAILED:");
        console.error(error);
        if (error instanceof Error && error.toString().includes('SequelizeEagerLoadingError')) {
            console.log("EagerLoadingError detected!");
        }
        process.exit(1);
    }
}

testQueries();
