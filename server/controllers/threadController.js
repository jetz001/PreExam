const { Thread, User, InterestTag, ThreadTag, SearchLog, Sequelize } = require('../models');
const { logActivity } = require('../utils/activityLogger');
const db = require('../models');
const { Op } = require('sequelize');

exports.createThread = async (req, res) => {
    try {
        const { title, content, category, background_style, tags, poll, shared_news_id } = req.body;
        const userId = req.user.id;

        // Premium Check for Polls
        if (poll && req.user.plan_type !== 'premium') {
            // return res.status(403).json({ error: 'Only Premium users can create polls' });
        }

        const thread = await Thread.create({
            user_id: userId,
            title,
            content,
            category,
            background_style,
            image_url: req.file ? `/uploads/${req.file.filename}` : null,
            shared_news_id: shared_news_id || null
        });

        // Handle Polls
        if (poll) {
            const pollData = JSON.parse(poll);
            const { question, options, expires_at } = pollData;

            const newPoll = await db.Poll.create({
                thread_id: thread.id,
                question,
                expires_at
            });

            if (options && options.length > 0) {
                const optionPromises = options.map(opt => db.PollOption.create({
                    poll_id: newPoll.id,
                    option_text: opt
                }));
                await Promise.all(optionPromises);
            }
        }

        // Handle Tags
        if (tags) {
            const tagList = JSON.parse(tags);
            for (const tagName of tagList) {
                const [tag] = await InterestTag.findOrCreate({
                    where: { tag_name: tagName },
                    defaults: { usage_count: 1 }
                });
                await tag.increment('usage_count');
                await ThreadTag.create({ thread_id: thread.id, tag_id: tag.id });
            }
        }

        const fullThread = await Thread.findByPk(thread.id, {
            include: [
                { model: User, attributes: ['id', 'display_name', 'avatar'] },
                { model: db.News, as: 'SharedNews' }
            ]
        });

        // Socket.io Emit
        const io = req.app.get('io');
        io.emit('new_thread', fullThread);

        // Log Activity
        logActivity(req, 'BTN_CREATE_THREAD', { thread_id: thread.id, title: thread.title });

        res.status(201).json(fullThread);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error creating thread' });
    }
};

exports.shareNews = async (req, res) => {
    try {
        const { newsId, content } = req.body;
        const userId = req.user.id;

        const news = await db.News.findByPk(newsId);
        if (!news) {
            return res.status(404).json({ error: 'News not found' });
        }

        const thread = await Thread.create({
            user_id: userId,
            title: `แชร์ข่าว: ${news.title}`,
            content: content || `ตรวจสอบข่าวนี้: ${news.title}`,
            category: 'News Discussion',
            shared_news_id: newsId
        });

        const fullThread = await Thread.findByPk(thread.id, {
            include: [
                { model: User, attributes: ['id', 'display_name', 'avatar'] },
                { model: db.News, as: 'SharedNews' }
            ]
        });

        const io = req.app.get('io');
        io.emit('new_thread', fullThread);

        res.status(201).json({ success: true, data: fullThread });
    } catch (error) {
        console.error("Share news error", error);
        res.status(500).json({ error: 'Server error sharing news' });
    }
};

exports.shareBusinessPost = async (req, res) => {
    try {
        const { postId, content } = req.body;
        const userId = req.user.id;

        const post = await db.BusinessPost.findByPk(postId, {
            include: [{ model: db.Business, as: 'Business' }]
        });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const thread = await Thread.create({
            user_id: userId,
            title: `แชร์โพสต์จาก ${post.Business.name}: ${post.title}`,
            content: content || `ตรวจสอบโพสต์นี้: ${post.title}`,
            category: 'General',
            shared_business_post_id: postId
        });

        const fullThread = await Thread.findByPk(thread.id, {
            include: [
                { model: User, attributes: ['id', 'display_name', 'avatar'] },
                { model: db.News, as: 'SharedNews' },
                { model: db.BusinessPost, as: 'SharedBusinessPost', include: [{ model: db.Business, as: 'Business' }] }
            ]
        });

        const io = req.app.get('io');
        io.emit('new_thread', fullThread);

        res.status(201).json({ success: true, data: fullThread });
    } catch (error) {
        console.error('Share Post Error:', error);
        res.status(500).json({ error: 'Server error sharing post' });
    }
};

exports.getThreads = async (req, res) => {
    try {
        const { cursor, limit = 10, category, search, sort = 'newest' } = req.query;
        const whereClause = {};

        if (category && category !== 'all') {
            whereClause.category = category;
        }

        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { content: { [Op.like]: `%${search}%` } }
            ];
            // Log search
            if (req.user) {
                SearchLog.create({ user_id: req.user.id, keyword: search });
            }
        }

        // Pagination (Cursor-based)
        if (cursor) {
            whereClause.id = { [Op.lt]: cursor };
        }

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
                { model: db.Comment, attributes: ['id'] }, // Only need ID for count
                {
                    model: db.Poll,
                    include: [{ model: db.PollOption, as: 'Options' }]
                },
                { model: db.News, as: 'SharedNews' },
                { model: db.BusinessPost, as: 'SharedBusinessPost', include: [{ model: db.Business, as: 'Business' }] }
            ],
        });

        // Add 'isLiked' field manually
        const userId = req.user ? req.user.id : null;
        const threadsWithLiked = await Promise.all(threads.map(async t => {
            const threadJson = t.toJSON();
            // 1. Liked Logic
            if (userId) {
                const like = await db.ThreadLike.findOne({ where: { user_id: userId, thread_id: t.id } });
                threadJson.isLiked = !!like;
            } else {
                threadJson.isLiked = false;
            }

            // 2. Poll Logic
            if (t.Poll && userId) {
                const vote = await db.PollVote.findOne({ where: { poll_id: t.Poll.id, user_id: userId } });
                if (threadJson.Poll) {
                    threadJson.Poll.isVoted = !!vote;
                }
            } else if (threadJson.Poll) {
                threadJson.Poll.isVoted = false;
            }
            return threadJson;
        }));

        if (threadsWithLiked.length === parseInt(limit)) {
            nextCursor = threadsWithLiked[threadsWithLiked.length - 1].id;
        }

        // Log Community View (Only first page / no cursor)
        if (!cursor && req.user) {
            logActivity(req, 'BTN_VIEW_COMMUNITY', { category: category || 'all', search: search || null });
        }

        res.json({ threads: threadsWithLiked, nextCursor });
    } catch (error) {
        console.error('ERROR in getThreads:', error);
        res.status(500).json({ error: 'Server error fetching threads' });
    }
};

exports.getThreadById = async (req, res) => {
    try {
        const { id } = req.params;
        const thread = await Thread.findByPk(id, {
            include: [
                { model: User, attributes: ['id', 'display_name', 'avatar'] },
                { model: InterestTag, through: { attributes: [] } },
                { model: db.Comment, attributes: ['id'] },
                {
                    model: db.Poll,
                    include: [{ model: db.PollOption, as: 'Options' }]
                },
                { model: db.News, as: 'SharedNews' },
                { model: db.BusinessPost, as: 'SharedBusinessPost', include: [{ model: db.Business, as: 'Business' }] }
            ]
        });

        if (!thread) return res.status(404).json({ error: 'Thread not found' });

        // Increment views
        await thread.increment('views');

        // Log Activity
        if (req.user) {
            logActivity(req, 'BTN_VIEW_THREAD', { thread_id: id, title: thread.title });
        }

        const threadJson = thread.toJSON();

        // Parse req.user? The middleware attaches it?
        // Wait, getThreadById might be public? 
        // If authMiddleware is optional or we check if req.user exists.
        // Usually authMiddleware ensures req.user.

        if (req.user) {
            const userId = req.user.id;
            const like = await db.ThreadLike.findOne({ where: { user_id: userId, thread_id: id } });
            threadJson.isLiked = !!like;

            if (threadJson.Poll) {
                const vote = await db.PollVote.findOne({ where: { poll_id: threadJson.Poll.id, user_id: userId } });
                threadJson.Poll.isVoted = !!vote;
            }
        } else {
            threadJson.isLiked = false;
            if (threadJson.Poll) threadJson.Poll.isVoted = false;
        }

        res.json(threadJson);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.likeThread = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const thread = await Thread.findByPk(id);
        if (!thread) return res.status(404).json({ error: 'Thread not found' });

        const existingLike = await db.ThreadLike.findOne({
            where: { user_id: userId, thread_id: id }
        });

        let liked = false;
        if (existingLike) {
            await existingLike.destroy();
            await thread.decrement('likes');
            liked = false;
        } else {
            await db.ThreadLike.create({ user_id: userId, thread_id: id });
            await thread.increment('likes');
            liked = true;
        }

        await thread.reload();
        res.json({ likes: thread.likes, liked });
    } catch (error) {
        console.error("Like error", error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.votePoll = async (req, res) => {
    try {
        const { pollId, optionId } = req.body;
        const userId = req.user.id;

        // Check if already voted
        const existingVote = await db.PollVote.findOne({ where: { poll_id: pollId, user_id: userId } });
        if (existingVote) {
            return res.status(400).json({ error: 'You have already voted on this poll' });
        }

        await db.PollVote.create({ poll_id: pollId, option_id: optionId, user_id: userId });
        await db.PollOption.increment('vote_count', { where: { id: optionId } });

        // Emit update
        const io = req.app.get('io');
        const updatedPoll = await db.Poll.findByPk(pollId, {
            include: [{ model: db.PollOption, as: 'Options' }]
        });

        io.emit('poll_updated', updatedPoll);

        res.json(updatedPoll);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error voting' });
    }
};

exports.getUserThreads = async (req, res) => {
    try {
        const { userId } = req.params;
        const threadLimit = 20;

        const threads = await Thread.findAll({
            where: { user_id: userId },
            limit: threadLimit,
            order: [['created_at', 'DESC']],
            include: [
                { model: User, attributes: ['id', 'display_name', 'avatar'] },
                { model: db.Comment, attributes: ['id'] },
                { model: db.ThreadLike, attributes: ['id'] }
            ]
        });

        const threadsJson = threads.map(t => {
            const json = t.toJSON();
            if (req.user) {
                json.isLiked = false;
            }
            return json;
        });

        res.json(threadsJson);
    } catch (error) {
        console.error("Get User Threads Error", error);
        res.status(500).json({ error: 'Server error fetching user threads' });
    }
};

exports.getTrendingTags = async (req, res) => {
    try {
        // Query to group by keyword and count occurrences
        const tags = await SearchLog.findAll({
            attributes: [
                'keyword',
                [db.sequelize.fn('COUNT', db.sequelize.col('keyword')), 'count']
            ],
            group: ['keyword'],
            order: [[db.sequelize.literal('count'), 'DESC']],
            limit: 8
        });

        // Return array of objects { keyword, count } or just keywords
        res.json(tags);
    } catch (error) {
        console.error('Get Trending Tags Error:', error);
        res.status(500).json({ error: 'Server error fetching trending tags' });
    }
};

exports.deleteThread = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role; // Assuming role is available on req.user

        const thread = await Thread.findByPk(id);

        if (!thread) {
            return res.status(404).json({ error: 'Thread not found' });
        }

        // Authorization Check
        if (thread.user_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to delete this thread' });
        }

        // Delete (Cascade should handle related items, but let's be safe if needed)
        await thread.destroy();

        // Socket emit for deletion? Optional but good for real-time
        const io = req.app.get('io');
        io.emit('delete_thread', id);

        res.json({ message: 'Thread deleted successfully' });
    } catch (error) {
        console.error('Delete Thread Error:', error);
        res.status(500).json({ error: 'Server error deleting thread' });
    }
};
