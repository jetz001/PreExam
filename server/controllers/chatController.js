const { db: firestore, admin } = require('../config/firebase');

const chatRoomsRef = firestore.collection('chat_rooms');
const usersRef = firestore.collection('users');
const notificationsRef = firestore.collection('notifications');

const getRoomId = (uid1, uid2) => {
    const ids = [uid1.toString(), uid2.toString()].sort();
    return `${ids[0]}_${ids[1]}`;
};

exports.getMessages = async (req, res) => {
    try {
        const userId = req.user.id.toString();
        const friendId = req.params.friendId.toString();
        const roomId = getRoomId(userId, friendId);

        const snapshot = await chatRoomsRef.doc(roomId).collection('messages')
                                           .orderBy('created_at', 'asc')
                                           .limit(100) // basic limit
                                           .get();

        const messages = snapshot.docs.map(doc => doc.data());

        // Basic sender hydration
        const myDoc = await usersRef.doc(userId).get();
        const friendDoc = await usersRef.doc(friendId).get();
        
        const hydrated = messages.map(m => {
            if (m.sender_id === userId) {
                m.Sender = { id: userId, display_name: myDoc.data().display_name, avatar: myDoc.data().avatar };
            } else {
                m.Sender = { id: friendId, display_name: friendDoc.data().display_name, avatar: friendDoc.data().avatar };
            }
            return m;
        });

        res.json({ success: true, data: hydrated });
    } catch (error) {
        console.error("Get messages error", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const userId = req.user.id.toString();
        const friendId = req.body.friendId.toString();
        const message = req.body.message.trim();

        if (!message) return res.status(400).json({ error: "Message cannot be empty" });

        const roomId = getRoomId(userId, friendId);
        const roomRef = chatRoomsRef.doc(roomId);
        const msgRef = roomRef.collection('messages').doc();

        const msgData = {
            id: msgRef.id,
            sender_id: userId,
            receiver_id: friendId,
            message,
            is_read: false,
            created_at: new Date().toISOString()
        };

        await firestore.runTransaction(async (t) => {
            t.set(msgRef, msgData);
            
            const roomDoc = await t.get(roomRef);
            const data = roomDoc.exists ? roomDoc.data() : { participants: [userId, friendId], unread: {} };
            
            data.last_message = message;
            data.updated_at = msgData.created_at;
            data.unread = data.unread || {};
            data.unread[friendId] = (data.unread[friendId] || 0) + 1;

            t.set(roomRef, data, { merge: true });
        });

        const myDoc = await usersRef.doc(userId).get();
        msgData.Sender = { id: userId, display_name: myDoc.data().display_name, avatar: myDoc.data().avatar };

        const io = req.app.get('io');
        if (io) {
            io.to(`user_${friendId}`).emit('receive_private_message', msgData);
            io.to(`user_${userId}`).emit('receive_private_message', msgData);

            const notifRef = notificationsRef.doc();
            const notifData = {
                id: notifRef.id,
                user_id: friendId,
                type: 'private_message',
                source_id: userId,
                message: `${req.user.display_name} sent you a message`,
                is_read: false,
                created_at: new Date().toISOString()
            };
            await notifRef.set(notifData);
            io.to(`user_${friendId}`).emit('new_notification', notifData);
        }

        res.json({ success: true, data: msgData });
    } catch (error) {
        console.error("Send message error", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.markRead = async (req, res) => {
    try {
        const userId = req.user.id.toString();
        const friendId = req.body.friendId.toString();
        const roomId = getRoomId(userId, friendId);
        
        const roomRef = chatRoomsRef.doc(roomId);
        
        await firestore.runTransaction(async (t) => {
            const roomDoc = await t.get(roomRef);
            if (!roomDoc.exists) return;
            const data = roomDoc.data();
            
            if (data.unread && data.unread[userId] > 0) {
                data.unread[userId] = 0;
                t.update(roomRef, { unread: data.unread });
            }
            
            // Note: marking all messages as read in subcollection requires batch
            // Simplification: we rely on unread count in room. 
            // In a real app, query unread messages and batch update them.
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

exports.getInboxConversations = async (req, res) => {
    try {
        const userId = req.user.id.toString();
        
        const snapshot = await chatRoomsRef.where('participants', 'array-contains', userId)
                                           .orderBy('updated_at', 'desc')
                                           .get();
        
        const conversations = await Promise.all(snapshot.docs.map(async doc => {
            const data = doc.data();
            const friendId = data.participants.find(id => id !== userId);
            const friendDoc = await usersRef.doc(friendId).get();
            
            return {
                friend_id: friendId,
                display_name: friendDoc.exists ? friendDoc.data().display_name : 'Unknown',
                avatar: friendDoc.exists ? friendDoc.data().avatar : null,
                last_message_id: null,
                last_message: data.last_message,
                last_message_date: data.updated_at,
                unread_count: (data.unread && data.unread[userId]) || 0
            };
        }));

        res.json({ success: true, data: conversations });
    } catch (error) {
        console.error("Get inbox error", error);
        res.status(500).json({ error: "Server error getting inbox" });
    }
};
