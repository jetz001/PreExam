const { Notification, User } = require('../models');

exports.createNotification = async ({ userId, actorId, type, referenceId, message }) => {
    try {
        if (userId === actorId) return; // Don't notify self

        await Notification.create({
            user_id: userId,
            actor_id: actorId,
            type,
            reference_id: referenceId,
            message
        });

        // Socket.io emit if online
        // Handled in calling controller usually, or here if we have access to io
    } catch (error) {
        console.error('Notification creation error:', error);
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { user_id: req.user.id },
            order: [['created_at', 'DESC']],
            limit: 20
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching notifications' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        await Notification.update({ is_read: true }, {
            where: { user_id: req.user.id, is_read: false }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Server error updating notifications' });
    }
};
