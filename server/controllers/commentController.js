const { db: firestore, admin } = require('../config/firebase');

const commentsRef = firestore.collection('comments');
const threadsRef = firestore.collection('threads');
const notificationsRef = firestore.collection('notifications');

exports.createComment = async (req, res) => {
    try {
        const { thread_id, content, parent_id } = req.body;
        const userId = req.user.id;

        const newCommentRef = commentsRef.doc();
        const commentId = newCommentRef.id;

        const author = {
            id: req.user.id,
            display_name: req.user.display_name || 'Unknown User',
            avatar: req.user.avatar || null,
            plan_type: req.user.plan_type || 'free'
        };

        const commentData = {
            id: commentId,
            thread_id,
            user_id: userId,
            author,
            content,
            parent_id: parent_id || null,
            likes: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Transaction to add comment and increment thread comment_count
        await firestore.runTransaction(async (t) => {
            const threadDocRef = threadsRef.doc(thread_id);
            const threadDoc = await t.get(threadDocRef);

            if (!threadDoc.exists) {
                throw new Error('Thread not found');
            }

            t.set(newCommentRef, commentData);
            
            // Increment comment count safely
            t.update(threadDocRef, {
                'stats.comments_count': admin.firestore.FieldValue.increment(1)
            });

            // If not the owner, notify them
            const threadData = threadDoc.data();
            if (threadData.user_id !== userId) {
                const notifRef = notificationsRef.doc();
                t.set(notifRef, {
                    id: notifRef.id,
                    user_id: threadData.user_id,
                    actor_id: userId,
                    type: 'reply_thread',
                    reference_id: thread_id,
                    message: 'someone replied to your thread',
                    is_read: false,
                    created_at: new Date().toISOString()
                });
            }
        });

        const io = req.app.get('io');
        if (io) {
            io.to(`thread_${thread_id}`).emit('new_comment', commentData);
            
            // Notify Thread Owner (fetch thread owner from somewhere, or assume we know it)
            // It's already saved in DB via transaction, we can just emit if we know their room.
            const threadDoc = await threadsRef.doc(thread_id).get();
            if(threadDoc.exists && threadDoc.data().user_id !== userId) {
                io.to(`user_${threadDoc.data().user_id}`).emit('new_notification', {
                    type: 'reply_thread',
                    actor_id: userId,
                    reference_id: thread_id,
                    message: 'someone replied to your thread'
                });
            }
        }

        res.status(201).json(commentData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error creating comment' });
    }
};

exports.getComments = async (req, res) => {
    try {
        const { threadId } = req.params;
        const snapshot = await commentsRef.where('thread_id', '==', threadId)
                                          .orderBy('created_at', 'asc')
                                          .get();

        const comments = snapshot.docs.map(doc => doc.data());
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.likeComment = async (req, res) => {
    try {
        const { id } = req.params;
        const commentRef = commentsRef.doc(id);
        const commentDoc = await commentRef.get();
        
        if (!commentDoc.exists) return res.status(404).json({ error: 'Comment not found' });

        // Simple increment for now. Ideally should track WHO liked it to prevent double likes,
        // but keeping it simple based on the original logic.
        await commentRef.update({
            likes: admin.firestore.FieldValue.increment(1)
        });

        const updatedDoc = await commentRef.get();
        res.json({ likes: updatedDoc.data().likes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error liking comment' });
    }
};
