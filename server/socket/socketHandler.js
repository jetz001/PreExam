const { db: firestore, admin } = require('../config/firebase');

const roomsRef = firestore.collection('exam_rooms');
const examResultsRef = firestore.collection('exam_results');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        const broadcastOnlineUsers = () => {
            const count = io.engine.clientsCount;
            io.emit('online_users', count);
        };

        broadcastOnlineUsers();

        // Join Room
        socket.on('join_room', async ({ roomId, userId }) => {
            try {
                socket.join(roomId);
                console.log(`User ${userId} joined room ${roomId}`);
                io.to(roomId).emit('user_joined', { userId });
            } catch (error) {
                console.error('Join room error:', error);
            }
        });

        // User Setup for Private Chat
        socket.on('join_user', (userId) => {
            socket.join(`user_${userId}`);
            console.log(`User ${userId} joined private room user_${userId}`);
        });

        // Leave Room
        socket.on('leave_room', ({ roomId, userId }) => {
            socket.leave(roomId);
            io.to(roomId).emit('user_left', { userId });
        });

        // Thread Real-time
        socket.on('join_thread', (threadId) => {
            const roomName = `thread_${threadId}`;
            socket.join(roomName);
            console.log(`Socket ${socket.id} joined ${roomName}`);
        });

        socket.on('leave_thread', (threadId) => {
            const roomName = `thread_${threadId}`;
            socket.leave(roomName);
            console.log(`Socket ${socket.id} left ${roomName}`);
        });

        // Support Ticket Real-time
        socket.on('join_ticket', (ticketId) => {
            const roomName = `ticket_${ticketId}`;
            socket.join(roomName);
            console.log(`Socket ${socket.id} joined ${roomName}`);
        });

        socket.on('leave_ticket', (ticketId) => {
            const roomName = `ticket_${ticketId}`;
            socket.leave(roomName);
            console.log(`Socket ${socket.id} left ${roomName}`);
        });

        // Chat Message
        socket.on('send_message', ({ roomId, userId, message, displayName }) => {
            io.to(roomId).emit('receive_message', {
                userId,
                displayName,
                message,
                timestamp: new Date()
            });
        });

        // Host starts exam
        socket.on('start_exam', async ({ roomId, userId }) => {
            try {
                const roomDoc = await roomsRef.doc(roomId.toString()).get();
                if (roomDoc.exists && roomDoc.data().host_user_id === userId.toString()) {
                    io.to(roomId).emit('exam_started');
                }
            } catch (error) {
                console.error('Start exam error:', error);
            }
        });

        // Tutor Navigation
        socket.on('tutor_navigate', ({ roomId, questionIndex }) => {
            io.to(roomId).emit('navigate_question', { questionIndex });
        });

        // Submit Score (Real-time leaderboard)
        socket.on('submit_score', async ({ roomId, userId, score }) => {
            try {
                await roomsRef.doc(roomId.toString()).collection('participants').doc(userId.toString()).update({ score });
                io.to(roomId).emit('score_updated', { userId, score });
            } catch (error) {
                console.error('Score update error:', error);
            }
        });

        // Host resets exam
        socket.on('reset_exam', async ({ roomId }) => {
            try {
                const partsSnap = await roomsRef.doc(roomId.toString()).collection('participants').get();
                const batch = firestore.batch();
                partsSnap.docs.forEach(doc => {
                    batch.update(doc.ref, { score: 0, status: 'joined', current_question_index: 0 });
                });
                await batch.commit();
                io.to(roomId).emit('exam_reset');
            } catch (error) {
                console.error('Reset exam error:', error);
            }
        });

        // Participant finishes exam
        socket.on('finish_exam', async ({ roomId, userId, score, timeTaken }) => {
            console.log(`[DEBUG] finish_exam called for room ${roomId}, user ${userId}, score ${score}`);
            try {
                const rDocRef = roomsRef.doc(roomId.toString());
                const pDocRef = rDocRef.collection('participants').doc(userId.toString());
                
                await pDocRef.update({ score, status: 'finished' });

                const roomDoc = await rDocRef.get();
                if (roomDoc.exists) {
                    const room = roomDoc.data();
                    const newResRef = examResultsRef.doc();
                    await newResRef.set({
                        id: newResRef.id,
                        user_id: userId.toString(),
                        score: score,
                        total_score: room.question_count || 0,
                        mode: 'classroom',
                        time_taken: timeTaken || 0,
                        taken_at: new Date().toISOString(),
                        subject_scores: { [room.subject || 'General']: score }
                    });
                }

                const participantsSnap = await rDocRef.collection('participants').get();
                const allFinished = participantsSnap.docs.every(d => d.data().status === 'finished');

                if (allFinished && participantsSnap.size > 0) {
                    await rDocRef.update({ status: 'finished' });
                }
            } catch (error) {
                console.error('Finish exam error:', error);
            }
        });

        // Host closes room (Tutor mode or manual finish)
        socket.on('close_room', async ({ roomId, userId }) => {
            try {
                const roomDoc = await roomsRef.doc(roomId.toString()).get();
                if (roomDoc.exists && roomDoc.data().host_user_id === userId.toString()) {
                    await roomDoc.ref.update({ status: 'finished' });
                    io.to(roomId).emit('room_closed_by_host');
                }
            } catch (error) {
                console.error('Close room error:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            broadcastOnlineUsers();
        });
    });
};
