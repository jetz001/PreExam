const { User, Friendship, Sequelize } = require('../models');
const { Op } = Sequelize;

exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json({ success: true, data: [] });

        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { display_name: { [Op.like]: `%${query}%` } },
                    { public_id: { [Op.like]: `%${query}%` } }, // Support referral code search
                    { email: { [Op.like]: `%${query}%` } }
                ],
                id: { [Op.ne]: req.user.id } // Exclude self
            },
            attributes: ['id', 'display_name', 'avatar', 'public_id', 'bio'],
            limit: 10
        });

        // Add friend status
        const myId = req.user.id;
        const usersWithStatus = await Promise.all(users.map(async u => {
            const friendship = await Friendship.findOne({
                where: {
                    [Op.or]: [
                        { user_id: myId, friend_id: u.id },
                        { user_id: u.id, friend_id: myId }
                    ]
                }
            });

            let status = 'none';
            if (friendship) {
                if (friendship.status === 'accepted') status = 'friends';
                else if (friendship.user_id === myId) status = 'sent';
                else status = 'received';
            }
            return { ...u.toJSON(), status };
        }));

        res.json({ success: true, data: usersWithStatus });
    } catch (error) {
        console.error("Search users error", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.sendRequest = async (req, res) => {
    try {
        const { friendId } = req.body;
        const userId = req.user.id;

        if (userId == friendId) {
            return res.status(400).json({ error: "Cannot add yourself" });
        }


        // Check if exists
        const recipient = await User.findByPk(friendId);
        if (!recipient) return res.status(404).json({ error: "User not found" });

        if (recipient.allow_friend_request === false) {
            return res.status(400).json({ error: "User does not accept friend requests" });
        }

        const existing = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { user_id: userId, friend_id: friendId },
                    { user_id: friendId, friend_id: userId }
                ]
            }
        });

        if (existing) {
            if (existing.status === 'accepted') {
                return res.status(400).json({ error: "Already friends" });
            }
            if (existing.user_id === userId) {
                return res.status(400).json({ error: "Request already sent" });
            }
            // If existing request from them, auto accept? Or separate logic?
            // For now, let's just say "Request already pending" or "They sent you one"
            return res.status(400).json({ error: "Request pending from other user" });
        }

        await Friendship.create({
            user_id: userId,
            friend_id: friendId,
            status: 'pending'
        });

        res.json({ success: true, message: "Friend request sent" });
    } catch (error) {
        console.error("Send request error", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.acceptRequest = async (req, res) => {
    try {
        const { requestId } = req.body; // Can accept by Friendship ID, OR by userId. Let's support userId for cleaner UI logic usually.
        // Actually UI usually knows who they are clicking.

        // Let's implement accept by "friend_id" (which is the requester)
        const { friendId } = req.body;
        const userId = req.user.id;

        const request = await Friendship.findOne({
            where: {
                user_id: friendId,
                friend_id: userId,
                status: 'pending'
            }
        });

        if (!request) {
            return res.status(404).json({ error: "Request not found" });
        }

        request.status = 'accepted';
        await request.save();

        res.json({ success: true, message: "Friend request accepted" });
    } catch (error) {
        console.error("Accept request error", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.removeFriend = async (req, res) => {
    try {
        const { friendId } = req.params; // or query
        const userId = req.user.id;

        await Friendship.destroy({
            where: {
                [Op.or]: [
                    { user_id: userId, friend_id: friendId },
                    { user_id: friendId, friend_id: userId }
                ]
            }
        });

        res.json({ success: true, message: "Friend removed" });
    } catch (error) {
        console.error("Remove friend error", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.getFriends = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all ACCEPTED friendships involved
        const friendships = await Friendship.findAll({
            where: {
                status: 'accepted',
                [Op.or]: [
                    { user_id: userId },
                    { friend_id: userId }
                ]
            },
            include: [
                { model: User, as: 'Requester', attributes: ['id', 'display_name', 'avatar', 'public_id', 'last_active_at', 'is_online_visible'] },
                { model: User, as: 'Recipient', attributes: ['id', 'display_name', 'avatar', 'public_id', 'last_active_at', 'is_online_visible'] }
            ]
        });

        // Map to just the 'other' user
        const friends = friendships.map(f => {
            if (f.user_id === userId) return f.Recipient;
            return f.Requester;
        });

        res.json({ success: true, data: friends });
    } catch (error) {
        console.error("Get friends error", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.checkStatus = async (req, res) => {
    try {
        const { userId: otherId } = req.params;
        const myId = req.user.id;

        const friendship = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { user_id: myId, friend_id: otherId },
                    { user_id: otherId, friend_id: myId }
                ]
            }
        });

        if (!friendship) {
            return res.json({ status: 'none' });
        }

        if (friendship.status === 'accepted') {
            return res.json({ status: 'friends' });
        }

        // Pending
        if (friendship.user_id === myId) {
            return res.json({ status: 'sent' });
        } else {
            return res.json({ status: 'received' });
        }

    } catch (error) {
        console.error("Check status error", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.getPendingRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await Friendship.findAll({
            where: {
                friend_id: userId,
                status: 'pending'
            },
            include: [
                { model: User, as: 'Requester', attributes: ['id', 'display_name', 'avatar'] }
            ]
        });

        const users = requests.map(r => r.Requester);

        res.json({ success: true, data: users });
    } catch (error) {
        console.error("Get pending error", error);
        res.status(500).json({ error: "Server error" });
    }
};
