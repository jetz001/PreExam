const { db: firestore } = require('../config/firebase');

const roomsRef = firestore.collection('exam_rooms');
const usersRef = firestore.collection('users');
const questionsRef = firestore.collection('questions');

exports.createRoom = async (req, res) => {
    try {
        const { name, mode, subject, category, max_participants, question_count, time_limit, password, custom_questions, tutor_submode } = req.body;
        const userId = req.user.id.toString();

        if (req.user.email && req.user.email.startsWith('guest_')) {
            return res.status(403).json({ success: false, message: 'Guests cannot create rooms.' });
        }

        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const limitParticipants = max_participants ? Math.min(parseInt(max_participants), 20) : 20;

        let availableQuestions = [];
        let finalQuestionCount = question_count || 20;

        if (custom_questions && Array.isArray(custom_questions) && custom_questions.length > 0) {
            finalQuestionCount = custom_questions.length;
        } else {
            // Fetch questions from bank
            let qQuery = questionsRef;
            if (subject) qQuery = qQuery.where('subject', '==', subject);
            
            const qSnap = await qQuery.limit(50).get(); // fetch 50 and pick random
            availableQuestions = qSnap.docs.map(d => d.id);
            availableQuestions = availableQuestions.sort(() => 0.5 - Math.random()).slice(0, finalQuestionCount);
        }

        let theme = req.body.theme || null;
        if (theme && req.user.plan_type !== 'premium') theme = null;

        const newRoomRef = roomsRef.doc();
        const roomData = {
            id: newRoomRef.id,
            code,
            name,
            mode,
            tutor_submode: tutor_submode || 'step',
            host_user_id: userId,
            subject,
            category: category || null,
            max_participants: limitParticipants,
            question_count: finalQuestionCount,
            status: 'waiting',
            question_ids: availableQuestions,
            custom_questions: custom_questions || null,
            settings: {
                time_limit: time_limit ? Math.max(5, Math.min(parseInt(time_limit), 60)) : 60
            },
            password: password || null,
            theme,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        await newRoomRef.set(roomData);
        await newRoomRef.collection('participants').doc(userId).set({
            user_id: userId,
            status: 'joined',
            joined_at: new Date().toISOString()
        });

        res.status(201).json({ success: true, data: roomData });
    } catch (error) {
        console.error('Create Room Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getRooms = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const snapshot = await roomsRef.orderBy('created_at', 'desc')
                                       .limit(50)
                                       .get();

        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        const now = Date.now();

        let filteredDocs = snapshot.docs.filter(doc => {
            const data = doc.data();
            if (!['waiting', 'in_progress'].includes(data.status)) return false;
            
            // Check if room is older than 24 hours
            if (data.created_at) {
                const createdAt = new Date(data.created_at).getTime();
                if (now - createdAt > ONE_DAY_MS) return false;
            }
            return true;
        });
        filteredDocs = filteredDocs.slice(0, limit);

        const data = await Promise.all(filteredDocs.map(async doc => {
            const room = doc.data();
            let hostDoc = null;
            if (room.host_user_id) {
                hostDoc = await usersRef.doc(String(room.host_user_id)).get();
            }
            const pSnap = await doc.ref.collection('participants').get();
            
            delete room.password; // hide password
            
            let hostDisplayName = 'Unknown';
            let hostPlanType = 'free';
            if (hostDoc && hostDoc.exists) {
                const hd = hostDoc.data();
                hostDisplayName = hd.display_name || hd.username || hd.email || 'Player';
                hostPlanType = hd.plan_type || 'free';
            }

            return {
                ...room,
                id: doc.id, // Ensure document id is returned
                Host: { display_name: hostDisplayName, plan_type: hostPlanType },
                participant_count: pSnap.size
            };
        }));

        res.json({
            success: true,
            data,
            pagination: { total: 100, page, totalPages: 5 } // mocked pagination totals
        });
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.joinRoom = async (req, res) => {
    try {
        const { code, password } = req.body;
        const userId = req.user.id.toString();

        const snapshot = await roomsRef.where('code', '==', code).limit(1).get();
        if (snapshot.empty) return res.status(404).json({ success: false, message: 'Room not found' });

        const roomDoc = snapshot.docs[0];
        const room = roomDoc.data();

        // Check if room is older than 24 hours
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        if (room.created_at && Date.now() - new Date(room.created_at).getTime() > ONE_DAY_MS) {
            return res.status(403).json({ success: false, message: 'ห้องสอบนี้หมดอายุแล้ว (เกิน 24 ชั่วโมง)' });
        }

        if (room.password) {
            if (!password) return res.status(403).json({ success: false, message: 'Password required', requirePassword: true });
            if (room.password !== password) return res.status(403).json({ success: false, message: 'Invalid password' });
        }

        const partRef = roomDoc.ref.collection('participants').doc(userId);
        const partDoc = await partRef.get();

        if (partDoc.exists) return res.json({ success: true, data: { ...room, id: roomDoc.id } });

        if (room.host_user_id === userId) {
            return res.json({ success: true, data: { ...room, id: roomDoc.id } });
        }

        if (room.status === 'finished') {
            return res.json({ success: true, data: { ...room, id: roomDoc.id } });
        }

        if (room.status !== 'waiting') {
            return res.status(400).json({ success: false, message: 'Room is already in progress' });
        }

        await partRef.set({ user_id: userId, status: 'joined', joined_at: new Date().toISOString() });
        res.json({ success: true, data: { ...room, id: roomDoc.id } });
    } catch (error) {
        console.error('Error joining room:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const roomDoc = await roomsRef.doc(id).get();
        if (!roomDoc.exists) return res.status(404).json({ success: false, message: 'Room not found' });

        const room = roomDoc.data();
        let hostDoc = null;
        if (room.host_user_id) {
            hostDoc = await usersRef.doc(String(room.host_user_id)).get();
        }
        const pSnap = await roomDoc.ref.collection('participants').get();
        
        const participants = await Promise.all(pSnap.docs.map(async pDoc => {
            const uDoc = await usersRef.doc(pDoc.id).get();
            return {
                user_id: pDoc.id,
                status: pDoc.data().status,
                score: pDoc.data().score || 0,
                nickname: pDoc.data().nickname || null,
                answers: pDoc.data().answers || null,
                User: uDoc.exists ? { display_name: uDoc.data().display_name, public_id: uDoc.data().public_id } : null
            };
        }));

        let questions = [];
        if (room.custom_questions && room.custom_questions.length > 0) {
            questions = room.custom_questions.map((q, idx) => ({ ...q, id: `custom_${idx}` }));
        } else if (room.question_ids && room.question_ids.length > 0) {
            for (const qid of room.question_ids) {
                const qDoc = await questionsRef.doc(qid).get();
                if (qDoc.exists) questions.push({ ...qDoc.data(), id: qDoc.id });
            }
        }

        res.json({
            success: true,
            data: {
                ...room,
                Host: hostDoc && hostDoc.exists ? { id: hostDoc.id, display_name: hostDoc.data().display_name || hostDoc.data().username || hostDoc.data().email || 'Player' } : { display_name: 'Unknown' },
                RoomParticipants: participants,
                questions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id.toString();

        const roomDoc = await roomsRef.doc(id).get();
        if (!roomDoc.exists) return res.json({ success: true, message: 'Room already deleted or not found' });

        if (roomDoc.data().host_user_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // manual subcollection delete (simplified for this migration)
        const pSnap = await roomDoc.ref.collection('participants').get();
        const batch = firestore.batch();
        pSnap.docs.forEach(d => batch.delete(d.ref));
        batch.delete(roomDoc.ref);
        await batch.commit();

        res.json({ success: true, message: 'Room deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
