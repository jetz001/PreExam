const { Room, RoomParticipant, User, ExamResult } = require('../models');

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

                // Notify others
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
                const room = await Room.findByPk(roomId);
                if (room && room.host_user_id == userId) {
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
            // Update DB (simplified)
            try {
                await RoomParticipant.update({ score }, { where: { room_id: roomId, user_id: userId } });

                // Broadcast update
                io.to(roomId).emit('score_updated', { userId, score });
            } catch (error) {
                console.error('Score update error:', error);
            }
        });

        // Host resets exam
        socket.on('reset_exam', async ({ roomId }) => {
            try {
                // Reset all participants in this room
                await RoomParticipant.update(
                    { score: 0, status: 'joined', current_question_index: 0 },
                    { where: { room_id: roomId } }
                );
                io.to(roomId).emit('exam_reset');
            } catch (error) {
                console.error('Reset exam error:', error);
            }
        });

        // Participant finishes exam
        socket.on('finish_exam', async ({ roomId, userId, score, timeTaken }) => {
            console.log(`[DEBUG] finish_exam called for room ${roomId}, user ${userId}, score ${score}`);
            try {
                await RoomParticipant.update(
                    { score, status: 'finished' },
                    { where: { room_id: roomId, user_id: userId } }
                );

                // Save to ExamResult for statistics
                const room = await Room.findByPk(roomId);
                if (room) {
                    await ExamResult.create({
                        user_id: userId,
                        score: score,
                        total_score: room.question_count,
                        mode: 'classroom', // Use classroom mode for multiplayer rooms
                        time_taken: timeTaken || 0,
                        taken_at: new Date(),
                        subject_scores: { [room.subject]: score } // Simple subject tracking
                    });
                }

                // Check if all participants have finished
                const participants = await RoomParticipant.findAll({ where: { room_id: roomId } });
                const allFinished = participants.every(p => p.status === 'finished');

                if (allFinished) {
                    await Room.update({ status: 'finished' }, { where: { id: roomId } });
                    // io.to(roomId).emit('room_closed'); // Keep room open for viewing scores
                }

            } catch (error) {
                console.error('Finish exam error:', error);
            }
        });

        // Host closes room (Tutor mode or manual finish)
        socket.on('close_room', async ({ roomId, userId }) => {
            try {
                const room = await Room.findByPk(roomId);
                if (room && room.host_user_id == userId) {
                    await Room.update({ status: 'finished' }, { where: { id: roomId } });
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
