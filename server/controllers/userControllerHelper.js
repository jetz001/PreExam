exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check password if provided in body for extra security? User prompt didn't strictly require API password check, but Modal 2-step.
        // Let's stick to standard authMiddleware protection first.

        // Manual Cascade Deletion (Safety first)
        // Adjust models based on what we know exists:
        // ExamResult, Bookmark, Thread, Comment (if any), StudyGroupMember, GroupMessage, Friendships

        // 1. Delete Exam Results
        await ExamResult.destroy({ where: { user_id: userId } });

        // 2. Delete Bookmarks
        const { Bookmark, Thread, StudyGroupMember, GroupMessage, Friendship } = require('../models');
        if (Bookmark) await Bookmark.destroy({ where: { user_id: userId } });

        // 3. Delete Threads (or set null? Usually delete)
        if (Thread) await Thread.destroy({ where: { user_id: userId } });

        // 4. Study Group Memberships
        if (StudyGroupMember) await StudyGroupMember.destroy({ where: { user_id: userId } });

        // 5. Group Messages
        if (GroupMessage) await GroupMessage.destroy({ where: { user_id: userId } });

        // 6. Friendships (Complex: user_id OR friend_id)
        if (Friendship) { // Wait, model is 'Friendships' or 'Friendship'? Checked schema: Friendships
            const { Op } = require('sequelize');
            await Friendship.destroy({
                where: {
                    [Op.or]: [{ user_id: userId }, { friend_id: userId }]
                }
            });
        }

        // Finally Delete User
        await User.destroy({ where: { id: userId } });

        res.json({ success: true, message: 'Account deleted' });
    } catch (error) {
        console.error("Delete Account Error", error);
        res.status(500).json({ success: false, message: 'Server error deleting account' });
    }
};
