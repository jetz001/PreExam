const { db: firestore } = require('../config/firebase');

const groupsRef = firestore.collection('study_groups');
const usersRef = firestore.collection('users');
const notificationsRef = firestore.collection('notifications');

exports.getAllGroups = async (req, res) => {
    try {
        const { search } = req.query;
        let snapshot;

        if (search) {
            // Simple string matching simulation for search in Firebase
            // Firestore doesn't support native wildcard text search well, 
            // but we fetch a batch and filter in memory since groups are small.
            snapshot = await groupsRef.limit(50).get();
        } else {
            snapshot = await groupsRef.limit(20).get();
        }

        let groups = snapshot.docs.map(doc => doc.data());

        if (search) {
            const lowerS = search.toLowerCase();
            groups = groups.filter(g => g.name.toLowerCase().includes(lowerS));
        }

        const userId = req.user ? req.user.id.toString() : null;
        
        const groupsWithMeta = groups.map(g => {
            const members = g.members || [];
            return {
                ...g,
                memberCount: members.length,
                isJoined: userId ? members.includes(userId) : false
            };
        });

        res.json({ success: true, data: groupsWithMeta });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getMyGroups = async (req, res) => {
    try {
        const userId = req.user.id.toString();
        const snapshot = await groupsRef.where('members', 'array-contains', userId).get();
        
        const groups = snapshot.docs.map(doc => {
            const g = doc.data();
            g.memberCount = (g.members || []).length;
            return g;
        });

        res.json({ success: true, data: groups });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.createGroup = async (req, res) => {
    try {
        const { name, description, subject, max_members, is_private, password } = req.body;
        const userId = req.user.id.toString();

        const newRef = groupsRef.doc();
        const groupData = {
            id: newRef.id,
            name,
            description,
            subject,
            max_members: max_members || 10,
            is_private: is_private || false,
            password: is_private ? password : null,
            owner_id: userId,
            members: [userId],
            created_at: new Date().toISOString()
        };

        await newRef.set(groupData);
        res.json({ success: true, data: groupData });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.joinGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        const userId = req.user.id.toString();

        const groupRef = groupsRef.doc(id);

        let success = false;
        let errorMessage = '';

        await firestore.runTransaction(async (t) => {
            const groupDoc = await t.get(groupRef);
            if (!groupDoc.exists) {
                errorMessage = 'Group not found';
                return;
            }

            const g = groupDoc.data();
            if (g.is_private && g.password !== password) {
                errorMessage = 'Incorrect password';
                return;
            }

            const members = g.members || [];
            if (members.includes(userId)) {
                errorMessage = 'Already joined';
                return;
            }

            if (members.length >= g.max_members) {
                errorMessage = 'Group is full';
                return;
            }

            members.push(userId);
            t.update(groupRef, { members });
            success = true;
        });

        if (!success) return res.status(400).json({ error: errorMessage });
        res.json({ success: true, message: 'Joined' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id.toString();

        const groupDoc = await groupsRef.doc(id).get();
        if (!groupDoc.exists || !(groupDoc.data().members || []).includes(userId)) {
            return res.status(403).json({ error: 'Not a member' });
        }

        const snapshot = await groupsRef.doc(id).collection('messages')
                                        .orderBy('created_at', 'asc')
                                        .limit(50)
                                        .get();

        const messages = snapshot.docs.map(doc => doc.data());
        res.json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        const userId = req.user.id.toString();

        const groupDoc = await groupsRef.doc(id).get();
        const members = groupDoc.exists ? (groupDoc.data().members || []) : [];
        if (!groupDoc.exists || !members.includes(userId)) {
            return res.status(403).json({ error: 'Not a member' });
        }

        const msgRef = groupsRef.doc(id).collection('messages').doc();
        const userDoc = await usersRef.doc(userId).get();
        
        const fullMsg = {
            id: msgRef.id,
            group_id: id,
            user_id: userId,
            message,
            Sender: { id: userId, display_name: userDoc.data().display_name, avatar: userDoc.data().avatar },
            created_at: new Date().toISOString()
        };

        await msgRef.set(fullMsg);

        const io = req.app.get('io');
        if (io) {
            io.to(`group_${id}`).emit('group_message', fullMsg);

            const batch = firestore.batch();
            members.forEach(mId => {
                if (mId !== userId) {
                    const notifRef = notificationsRef.doc();
                    const notifData = {
                        id: notifRef.id,
                        user_id: mId,
                        type: 'group_message',
                        source_id: id,
                        message: `${req.user.display_name} sent a message in ${groupDoc.data().name}`,
                        is_read: false,
                        created_at: new Date().toISOString()
                    };
                    batch.set(notifRef, notifData);
                    io.to(`user_${mId}`).emit('new_notification', notifData);
                }
            });
            await batch.commit();
        }

        res.json({ success: true, data: fullMsg });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id.toString();

        const groupDoc = await groupsRef.doc(id).get();
        if (!groupDoc.exists) return res.status(404).json({ error: 'Group not found' });

        if (groupDoc.data().owner_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const mSnap = await groupDoc.ref.collection('messages').get();
        const batch = firestore.batch();
        mSnap.docs.forEach(d => batch.delete(d.ref));
        batch.delete(groupDoc.ref);
        await batch.commit();

        res.json({ success: true, message: 'Group deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
