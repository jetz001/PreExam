const { StudyGroup, StudyGroupMember, GroupMessage, User } = require('../models');
const { Op } = require('sequelize');

exports.getAllGroups = async (req, res) => {
    try {
        const { search } = req.query;
        const where = {};

        if (search) {
            where.name = { [Op.like]: `%${search}%` };
        }

        console.log("Searching groups with where:", where);

        const groups = await StudyGroup.findAll({
            where,
            limit: 20
        });

        // Add member count and isJoined flag
        const groupsWithMeta = await Promise.all(groups.map(async g => {
            const json = g.toJSON();
            json.memberCount = await StudyGroupMember.count({ where: { group_id: g.id } });
            if (req.user) {
                json.isJoined = await StudyGroupMember.count({ where: { group_id: g.id, user_id: req.user.id } }) > 0;
            } else {
                json.isJoined = false;
            }
            return json;
        }));

        res.json({ success: true, data: groupsWithMeta });
    } catch (error) {
        console.error("Get all groups error:", error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

exports.getMyGroups = async (req, res) => {
    try {
        const userId = req.user.id;
        const memberships = await StudyGroupMember.findAll({
            where: { user_id: userId },
            include: [{ model: StudyGroup }]
        });

        const groups = await Promise.all(memberships.map(async m => {
            const g = m.StudyGroup.toJSON();
            g.memberCount = await StudyGroupMember.count({ where: { group_id: g.id } });
            return g;
        }));

        res.json({ success: true, data: groups });
    } catch (error) {
        console.error("Get my groups error", error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createGroup = async (req, res) => {
    try {
        const { name, description, subject, max_members, is_private, password } = req.body;
        const group = await StudyGroup.create({
            name,
            description,
            subject,
            max_members: max_members || 10,
            is_private: is_private || false,
            password: is_private ? password : null,
            owner_id: req.user.id
        });

        await StudyGroupMember.create({
            group_id: group.id,
            user_id: req.user.id
        });

        res.json({ success: true, data: group });
    } catch (error) {
        console.error("Create group error", error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.joinGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        const group = await StudyGroup.findByPk(id);

        if (!group) return res.status(404).json({ error: 'Group not found' });

        if (group.is_private) {
            if (!password || password !== group.password) {
                return res.status(403).json({ error: 'Incorrect password' });
            }
        }

        const exists = await StudyGroupMember.findOne({
            where: { group_id: id, user_id: req.user.id }
        });

        if (exists) return res.status(400).json({ error: 'Already joined' });

        // Check max members
        const count = await StudyGroupMember.count({ where: { group_id: id } });
        if (count >= group.max_members) return res.status(400).json({ error: 'Group is full' });

        await StudyGroupMember.create({
            group_id: id,
            user_id: req.user.id
        });

        res.json({ success: true, message: 'Joined' });
    } catch (error) {
        console.error("Join group error", error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { id } = req.params;
        // Verify membership
        const isMember = await StudyGroupMember.findOne({ where: { group_id: id, user_id: req.user.id } });
        if (!isMember) return res.status(403).json({ error: 'Not a member' });

        const messages = await GroupMessage.findAll({
            where: { group_id: id },
            include: [{ model: User, as: 'Sender', attributes: ['id', 'display_name', 'avatar'] }],
            order: [['created_at', 'ASC']],
            limit: 50 // Limit for performance
        });

        res.json({ success: true, data: messages });
    } catch (error) {
        console.error("Get messages error", error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        // socket will be handled separately or here
        const newMsg = await GroupMessage.create({
            group_id: id,
            user_id: req.user.id,
            message
        });

        const fullMsg = await GroupMessage.findByPk(newMsg.id, {
            include: [{ model: User, as: 'Sender', attributes: ['id', 'display_name', 'avatar'] }]
        });

        // Emit socket event if io is available
        const io = req.app.get('io');
        if (io) {
            io.to(`group_${id}`).emit('group_message', fullMsg);

            // Create Notifications for offline/other members
            const members = await StudyGroupMember.findAll({ where: { group_id: id } });
            const notifications = [];

            for (const member of members) {
                if (member.user_id !== req.user.id) {
                    // Check if user wants notifications (Assuming user settings are checked here or we send to all and filter on client)
                    // For now, simpler to send to all and let client handle, or check User model if we eager loaded it.
                    // Doing a quick check via User model would be better but expensive for large groups.
                    // Let's create the notification first.

                    const notification = await require('../models').Notification.create({
                        user_id: member.user_id,
                        type: 'group_message',
                        source_id: id,
                        message: `${req.user.display_name} sent a message in ${newMsg.group_id}`, // Ideally fetch group name
                        is_read: false
                    });

                    // Specific room for user notification
                    io.to(`user_${member.user_id}`).emit('new_notification', notification);
                }
            }
        }

        res.json({ success: true, data: fullMsg });
    } catch (error) {
        console.error("Send message error", error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const group = await StudyGroup.findByPk(id);

        if (!group) return res.status(404).json({ error: 'Group not found' });

        // Allow Owner OR Admin
        if (group.owner_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Delete associated data
        await GroupMessage.destroy({ where: { group_id: id } });
        await StudyGroupMember.destroy({ where: { group_id: id } });
        await group.destroy();

        res.json({ success: true, message: 'Group deleted' });
    } catch (error) {
        console.error("Delete group error", error);
        res.status(500).json({ error: 'Server error' });
    }
};
