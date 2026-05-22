const { db: firestore } = require('../config/firebase');

const bookmarksRef = firestore.collection('bookmarks');

exports.getBookmarks = async (req, res) => {
    try {
        const snapshot = await bookmarksRef.where('user_id', '==', req.user.id.toString()).get();

        const bookmarks = snapshot.docs.map(doc => doc.data());
        // Sort in memory to avoid Firebase composite index requirement
        bookmarks.sort((a, b) => new Date(b.saved_at) - new Date(a.saved_at));
        
        res.json({ success: true, data: bookmarks });
    } catch (error) {
        console.error("Get bookmarks error", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.addBookmark = async (req, res) => {
    try {
        const { target_type, target_id, title } = req.body;
        const userId = req.user.id.toString();

        const snapshot = await bookmarksRef.where('user_id', '==', userId)
                                           .where('target_type', '==', target_type)
                                           .where('target_id', '==', target_id.toString())
                                           .limit(1)
                                           .get();

        if (!snapshot.empty) {
            return res.status(400).json({ success: false, message: 'Already bookmarked' });
        }

        const newDoc = bookmarksRef.doc();
        const bookmarkData = {
            id: newDoc.id,
            user_id: userId,
            target_type,
            target_id: target_id.toString(),
            title: title || 'Untitled Bookmark',
            saved_at: new Date().toISOString()
        };

        await newDoc.set(bookmarkData);
        res.json({ success: true, data: bookmarkData });
    } catch (error) {
        console.error("Add bookmark error", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.removeBookmark = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id.toString();

        const docRef = bookmarksRef.doc(id);
        const doc = await docRef.get();

        if (doc.exists && doc.data().user_id === userId) {
            await docRef.delete();
            return res.json({ success: true, message: 'Removed' });
        }
        res.status(404).json({ success: false, message: 'Bookmark not found or unauthorized' });
    } catch (error) {
        console.error("Remove bookmark error", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
