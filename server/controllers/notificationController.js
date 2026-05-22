const { db: firestore } = require('../config/firebase');

const notificationsRef = firestore.collection('notifications');

exports.createNotification = async ({ userId, actorId, type, referenceId, message }) => {
    try {
        if (userId === actorId) return; // Don't notify self

        const newDocRef = notificationsRef.doc();
        await newDocRef.set({
            id: newDocRef.id,
            user_id: userId.toString(),
            actor_id: actorId.toString(),
            type,
            reference_id: referenceId ? referenceId.toString() : null,
            message,
            is_read: false,
            created_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Notification creation error:', error);
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const snapshot = await notificationsRef.where('user_id', '==', req.user.id.toString())
                                               .orderBy('created_at', 'desc')
                                               .limit(20)
                                               .get();

        const notifications = snapshot.docs.map(doc => doc.data());
        res.json(notifications);
    } catch (error) {
        console.error('Fetch notification error:', error);
        res.status(500).json({ error: 'Server error fetching notifications' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const snapshot = await notificationsRef.where('user_id', '==', req.user.id.toString())
                                               .where('is_read', '==', false)
                                               .get();

        if (snapshot.empty) return res.json({ success: true });

        const batch = firestore.batch();
        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { is_read: true });
        });
        await batch.commit();

        res.json({ success: true });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: 'Server error updating notifications' });
    }
};
