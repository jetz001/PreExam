const { Bookmark, News, Thread, Question } = require('../models');

exports.getBookmarks = async (req, res) => {
    try {
        const bookmarks = await Bookmark.findAll({
            where: { user_id: req.user.id },
            order: [['saved_at', 'DESC']]
        });

        // Optionally fetch related data details if needed, or just return basic info
        // For efficiency, we just return what's in Bookmark table or do minimal hydration
        // But the UI shows Title. Bookmark model saves title? Checked model: Yes, "title" field.

        res.json({ success: true, data: bookmarks });
    } catch (error) {
        console.error("Get bookmarks error", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.addBookmark = async (req, res) => {
    try {
        const { target_type, target_id, title } = req.body;

        const existing = await Bookmark.findOne({
            where: { user_id: req.user.id, target_type, target_id }
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'Already bookmarked' });
        }

        const bookmark = await Bookmark.create({
            user_id: req.user.id,
            target_type,
            target_id,
            title // Client should send title to save DB hits
        });

        res.json({ success: true, data: bookmark });
    } catch (error) {
        console.error("Add bookmark error", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.removeBookmark = async (req, res) => {
    try {
        const { id } = req.params;
        await Bookmark.destroy({
            where: { id, user_id: req.user.id }
        });
        res.json({ success: true, message: 'Removed' });
    } catch (error) {
        console.error("Remove bookmark error", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
