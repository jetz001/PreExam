const db = require('../models');
const { PrivateMessage, User, Sequelize } = db;
const { Op } = Sequelize;

exports.getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { friendId } = req.params;

        const messages = await PrivateMessage.findAll({
            where: {
                [Op.or]: [
                    { sender_id: userId, receiver_id: friendId },
                    { sender_id: friendId, receiver_id: userId }
                ]
            },
            order: [['created_at', 'ASC']],
            include: [
                { model: User, as: 'Sender', attributes: ['id', 'display_name', 'avatar'] }
            ]
        });

        res.json({ success: true, data: messages });
    } catch (error) {
        console.error("Get messages error", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { friendId, message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ error: "Message cannot be empty" });
        }

        const newMessage = await PrivateMessage.create({
            sender_id: userId,
            receiver_id: friendId,
            message: message.trim()
        });

        // Populate sender info for frontend
        const messageWithData = await PrivateMessage.findByPk(newMessage.id, {
            include: [{ model: User, as: 'Sender', attributes: ['id', 'display_name', 'avatar'] }]
        });

        // Socket.io Real-time
        const io = req.app.get('io');
        if (io) {
            // Emit to Receiver
            io.to(`user_${friendId}`).emit('receive_private_message', messageWithData);
            // Emit to Sender (for multi-device sync)
            io.to(`user_${userId}`).emit('receive_private_message', messageWithData);

            // Create Notification for Receiver
            const notification = await require('../models').Notification.create({
                user_id: friendId,
                type: 'private_message',
                source_id: userId,
                message: `${req.user.display_name} sent you a message`,
                is_read: false
            });

            // Emit Notification Event
            io.to(`user_${friendId}`).emit('new_notification', notification);
        }

        res.json({ success: true, data: messageWithData });
    } catch (error) {
        console.error("Send message error", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.markRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { friendId } = req.body;

        await PrivateMessage.update(
            { is_read: true },
            {
                where: {
                    sender_id: friendId,
                    receiver_id: userId,
                    is_read: false
                }
            }
        );

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.getInboxConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all unique users the current user has chatted with
        // We'll use a raw query or complex Sequelize query to get the latest message per conversation
        
        const conversations = await db.sequelize.query(`
            SELECT 
                u.id as friend_id,
                u.display_name,
                u.avatar,
                m.id as last_message_id,
                m.message as last_message,
                m.created_at as last_message_date,
                m.sender_id as last_sender_id,
                (SELECT COUNT(*) FROM private_messages WHERE sender_id = u.id AND receiver_id = :userId AND is_read = 0) as unread_count
            FROM Users u
            JOIN (
                SELECT 
                    MAX(id) as max_id,
                    CASE WHEN sender_id = :userId THEN receiver_id ELSE sender_id END as contact_id
                FROM private_messages
                WHERE sender_id = :userId OR receiver_id = :userId
                GROUP BY contact_id
            ) latest_msg ON u.id = latest_msg.contact_id
            JOIN private_messages m ON m.id = latest_msg.max_id
            ORDER BY m.created_at DESC
        `, {
            replacements: { userId },
            type: Sequelize.QueryTypes.SELECT
        });

        res.json({ success: true, data: conversations });
    } catch (error) {
        console.error("Get inbox conversations error", error);
        res.status(500).json({ error: "Server error getting inbox" });
    }
};
