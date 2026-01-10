const { Comment, User, Thread } = require('../models');
const db = require('../models');
const notificationController = require('./notificationController');

exports.createComment = async (req, res) => {
    try {
        const { thread_id, content, parent_id } = req.body;
        const userId = req.user.id;

        const comment = await Comment.create({
            thread_id,
            user_id: userId,
            content,
            parent_id: parent_id || null
        });

        const fullComment = await Comment.findByPk(comment.id, {
            include: [{
                model: User,
                attributes: ['id', 'display_name', 'avatar'],
                include: [{ model: db.Business, as: 'MyBusiness', attributes: ['id', 'name', 'is_verified'] }]
            }]
        });

        const io = req.app.get('io');
        io.to(`thread_${thread_id}`).emit('new_comment', fullComment);

        // Notify Thread Owner
        const thread = await Thread.findByPk(thread_id);
        if (thread && thread.user_id !== userId) {
            await notificationController.createNotification({
                userId: thread.user_id,
                actorId: userId,
                type: 'reply_thread',
                referenceId: thread.id,
                message: 'someone replied to your thread'
            });

            io.to(`user_${thread.user_id}`).emit('new_notification', {
                type: 'reply_thread',
                actor_id: userId,
                reference_id: thread.id,
                message: 'someone replied to your thread'
            });
        }

        res.status(201).json(fullComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error creating comment' });
    }
};

exports.getComments = async (req, res) => {
    try {
        const { threadId } = req.params;
        const comments = await Comment.findAll({
            where: { thread_id: threadId },
            include: [{
                model: User,
                attributes: ['id', 'display_name', 'avatar'],
                include: [{ model: db.Business, as: 'MyBusiness', attributes: ['id', 'name', 'is_verified'] }]
            }],
            order: [['created_at', 'ASC']] // Oldest first for comments usually, but "Top Comments" requested.
            // For now, simple chronological. Frontend can rearrange.
        });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.likeComment = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findByPk(id);
        if (!comment) return res.status(404).json({ error: 'Comment not found' });

        await comment.increment('likes');
        await comment.reload();
        res.json({ likes: comment.likes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error liking comment' });
    }
};
