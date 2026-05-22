const { db: firestore, admin } = require('../config/firebase');

const usersRef = firestore.collection('users');

exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json({ success: true, data: [] });

        // Simple text search mock for Firestore
        const snapshot = await usersRef.limit(50).get();
        let users = snapshot.docs.map(d => {
            const data = d.data();
            return { id: d.id, display_name: data.display_name, avatar: data.avatar, public_id: data.public_id, bio: data.bio };
        });

        const lowerQ = query.toLowerCase();
        users = users.filter(u => u.id !== req.user.id.toString() && (
            (u.display_name && u.display_name.toLowerCase().includes(lowerQ)) ||
            (u.public_id && u.public_id.toLowerCase().includes(lowerQ))
        )).slice(0, 10);

        const myId = req.user.id.toString();
        const usersWithStatus = await Promise.all(users.map(async u => {
            const friendDoc = await usersRef.doc(myId).collection('friends').doc(u.id).get();
            let status = 'none';
            if (friendDoc.exists) {
                const fs = friendDoc.data().status;
                if (fs === 'accepted') status = 'friends';
                else if (fs === 'sent') status = 'sent';
                else if (fs === 'pending') status = 'received';
            }
            return { ...u, status };
        }));

        res.json({ success: true, data: usersWithStatus });
    } catch (error) {
        console.error("Search users error", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.sendRequest = async (req, res) => {
    try {
        const friendId = req.body.friendId.toString();
        const userId = req.user.id.toString();

        if (userId === friendId) return res.status(400).json({ error: "Cannot add yourself" });

        const recipientDoc = await usersRef.doc(friendId).get();
        if (!recipientDoc.exists) return res.status(404).json({ error: "User not found" });
        if (recipientDoc.data().allow_friend_request === false) {
            return res.status(400).json({ error: "User does not accept friend requests" });
        }

        const myFriendRef = usersRef.doc(userId).collection('friends').doc(friendId);
        const theirFriendRef = usersRef.doc(friendId).collection('friends').doc(userId);

        const myFriendDoc = await myFriendRef.get();
        if (myFriendDoc.exists) {
            const status = myFriendDoc.data().status;
            if (status === 'accepted') return res.status(400).json({ error: "Already friends" });
            if (status === 'sent') return res.status(400).json({ error: "Request already sent" });
            if (status === 'pending') return res.status(400).json({ error: "Request pending from other user" });
        }

        const batch = firestore.batch();
        batch.set(myFriendRef, { status: 'sent', created_at: new Date().toISOString() });
        batch.set(theirFriendRef, { status: 'pending', created_at: new Date().toISOString() });
        await batch.commit();

        res.json({ success: true, message: "Friend request sent" });
    } catch (error) {
        console.error("Send request error", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.acceptRequest = async (req, res) => {
    try {
        const friendId = req.body.friendId.toString();
        const userId = req.user.id.toString();

        const myFriendRef = usersRef.doc(userId).collection('friends').doc(friendId);
        const theirFriendRef = usersRef.doc(friendId).collection('friends').doc(userId);

        const myFriendDoc = await myFriendRef.get();
        if (!myFriendDoc.exists || myFriendDoc.data().status !== 'pending') {
            return res.status(404).json({ error: "Request not found" });
        }

        const batch = firestore.batch();
        batch.update(myFriendRef, { status: 'accepted' });
        batch.update(theirFriendRef, { status: 'accepted' });
        await batch.commit();

        res.json({ success: true, message: "Friend request accepted" });
    } catch (error) {
        console.error("Accept request error", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.removeFriend = async (req, res) => {
    try {
        const friendId = req.params.friendId.toString();
        const userId = req.user.id.toString();

        const myFriendRef = usersRef.doc(userId).collection('friends').doc(friendId);
        const theirFriendRef = usersRef.doc(friendId).collection('friends').doc(userId);

        const batch = firestore.batch();
        batch.delete(myFriendRef);
        batch.delete(theirFriendRef);
        await batch.commit();

        res.json({ success: true, message: "Friend removed" });
    } catch (error) {
        console.error("Remove friend error", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.getFriends = async (req, res) => {
    try {
        const userId = req.user.id.toString();
        const snapshot = await usersRef.doc(userId).collection('friends').where('status', '==', 'accepted').get();

        if (snapshot.empty) return res.json({ success: true, data: [] });

        const friendIds = snapshot.docs.map(d => d.id);
        const friends = [];
        
        for (const fId of friendIds) {
            const fDoc = await usersRef.doc(fId).get();
            if (fDoc.exists) {
                const data = fDoc.data();
                friends.push({
                    id: fDoc.id,
                    display_name: data.display_name,
                    avatar: data.avatar,
                    public_id: data.public_id,
                    last_active_at: data.last_active_at,
                    is_online_visible: data.is_online_visible
                });
            }
        }

        res.json({ success: true, data: friends });
    } catch (error) {
        console.error("Get friends error", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.checkStatus = async (req, res) => {
    try {
        const otherId = req.params.userId.toString();
        const myId = req.user.id.toString();

        const friendDoc = await usersRef.doc(myId).collection('friends').doc(otherId).get();
        
        if (!friendDoc.exists) return res.json({ status: 'none' });

        const fs = friendDoc.data().status;
        if (fs === 'accepted') return res.json({ status: 'friends' });
        if (fs === 'sent') return res.json({ status: 'sent' });
        if (fs === 'pending') return res.json({ status: 'received' });

        res.json({ status: 'none' });
    } catch (error) {
        console.error("Check status error", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.getPendingRequests = async (req, res) => {
    try {
        const userId = req.user.id.toString();
        const snapshot = await usersRef.doc(userId).collection('friends').where('status', '==', 'pending').get();

        if (snapshot.empty) return res.json({ success: true, data: [] });

        const requesterIds = snapshot.docs.map(d => d.id);
        const users = [];
        
        for (const reqId of requesterIds) {
            const rDoc = await usersRef.doc(reqId).get();
            if (rDoc.exists) {
                const data = rDoc.data();
                users.push({
                    id: rDoc.id,
                    display_name: data.display_name,
                    avatar: data.avatar
                });
            }
        }

        res.json({ success: true, data: users });
    } catch (error) {
        console.error("Get pending error", error);
        res.status(500).json({ error: "Server error" });
    }
};
