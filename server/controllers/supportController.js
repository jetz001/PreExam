const { db: firestore } = require('../config/firebase');

const ticketsRef = firestore.collection('support_tickets');
const usersRef = firestore.collection('users');

const supportController = {
    createTicket: async (req, res) => {
        try {
            const { category, subject, description, device_info, context_data } = req.body;
            const userId = req.user.id.toString();

            const userDoc = await usersRef.doc(userId).get();
            if (!userDoc.exists) return res.status(404).json({ success: false, message: 'User not found' });

            const user = userDoc.data();
            const user_tier = user.plan_type === 'premium' ? 'premium' : (user.role === 'sponsor' ? 'sponsor' : 'free');
            const priority = user_tier !== 'free' ? 'high' : 'normal';

            const newTicketRef = ticketsRef.doc();
            const ticketData = {
                id: newTicketRef.id,
                user_id: userId,
                user_tier,
                category,
                subject,
                description,
                priority,
                device_info: device_info || null,
                context_data: context_data || null,
                status: 'open',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await newTicketRef.set(ticketData);

            const msgRef = newTicketRef.collection('messages').doc();
            await msgRef.set({
                id: msgRef.id,
                sender_id: userId,
                role: 'user',
                message: description,
                created_at: new Date().toISOString()
            });

            const now = new Date();
            const hour = now.getHours();
            if (hour >= 22 || hour < 8) {
                const autoMsgRef = newTicketRef.collection('messages').doc();
                await autoMsgRef.set({
                    id: autoMsgRef.id,
                    sender_id: '1', // Admin
                    role: 'system',
                    message: "ได้รับเรื่องแล้ว จะรีบดำเนินการในเวลาทำการ (08:00 - 22:00 น.)",
                    created_at: new Date().toISOString()
                });
            }

            const io = req.app.get('io');
            if (io) io.emit('new_ticket', { ticket_id: newTicketRef.id, category, user_tier });

            res.status(201).json({ success: true, data: ticketData });
        } catch (error) {
            console.error('Error creating ticket:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    getMyTickets: async (req, res) => {
        try {
            const userId = req.user.id.toString();
            // Avoid composite index by sorting in memory
            const snapshot = await ticketsRef.where('user_id', '==', userId).get();
            let tickets = snapshot.docs.map(doc => doc.data());
            
            // Sort in memory by created_at desc
            tickets.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
            
            res.json({ success: true, data: tickets });
        } catch (error) {
            console.error('Error fetching tickets:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    getTicketDetails: async (req, res) => {
        try {
            const ticketId = req.params.id;
            const ticketDoc = await ticketsRef.doc(ticketId).get();
            if (!ticketDoc.exists) return res.status(404).json({ success: false, message: 'Ticket not found' });

            const ticket = ticketDoc.data();
            if (req.user.role !== 'admin' && ticket.user_id !== req.user.id.toString()) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }

            const userDoc = await usersRef.doc(String(ticket.user_id)).get();
            if (userDoc.exists) {
                const u = userDoc.data();
                ticket.user = { id: ticket.user_id, display_name: u.display_name, email: u.email, avatar: u.avatar, role: u.role, plan_type: u.plan_type };
            }

            const msgSnapshot = await ticketDoc.ref.collection('messages').orderBy('created_at', 'asc').get();
            ticket.messages = await Promise.all(msgSnapshot.docs.map(async doc => {
                const msg = doc.data();
                const senderDoc = await usersRef.doc(String(msg.sender_id)).get();
                if (senderDoc.exists) {
                    msg.sender = { id: msg.sender_id, display_name: senderDoc.data().display_name, avatar: senderDoc.data().avatar, role: senderDoc.data().role };
                }
                return msg;
            }));

            res.json({ success: true, data: ticket });
        } catch (error) {
            console.error('Error fetching ticket details:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    sendMessage: async (req, res) => {
        try {
            const { message, attachments, is_internal_note } = req.body;
            const ticketId = req.params.id;
            const userId = req.user.id.toString();

            const ticketDoc = await ticketsRef.doc(ticketId).get();
            if (!ticketDoc.exists) return res.status(404).json({ success: false, message: 'Ticket not found' });

            const ticket = ticketDoc.data();
            if (req.user.role !== 'admin' && ticket.user_id !== userId) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }

            const senderRole = req.user.role === 'admin' ? 'admin' : 'user';
            const msgRef = ticketDoc.ref.collection('messages').doc();

            const newMessage = {
                id: msgRef.id,
                ticket_id: ticketId,
                sender_id: userId,
                role: senderRole,
                message,
                attachments: attachments || null,
                is_internal_note: req.user.role === 'admin' ? is_internal_note : false,
                created_at: new Date().toISOString()
            };

            await msgRef.set(newMessage);

            if (senderRole === 'admin' && ticket.status === 'open' && !is_internal_note) {
                await ticketDoc.ref.update({ status: 'in_progress', updated_at: new Date().toISOString() });
            }

            const io = req.app.get('io');
            if (io) io.to(`ticket_${ticketId}`).emit('new_message', newMessage);

            res.status(201).json({ success: true, data: newMessage });
        } catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    updateStatus: async (req, res) => {
        try {
            const { status } = req.body;
            const ticketId = req.params.id;
            const userId = req.user.id.toString();

            const ticketDoc = await ticketsRef.doc(ticketId).get();
            if (!ticketDoc.exists) return res.status(404).json({ success: false, message: 'Ticket not found' });

            if (req.user.role !== 'admin') {
                if (ticketDoc.data().user_id !== userId || !['resolved', 'closed'].includes(status)) {
                    return res.status(403).json({ success: false, message: 'Unauthorized' });
                }
            }

            await ticketDoc.ref.update({ status, updated_at: new Date().toISOString() });

            const io = req.app.get('io');
            if (io) io.to(`ticket_${ticketId}`).emit('status_updated', { ticket_id: ticketId, status });

            res.json({ success: true, message: `Ticket status updated to ${status}` });
        } catch (error) {
            console.error('Error updating status:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    getAllTickets: async (req, res) => {
        try {
            // Avoid composite index by getting all and sorting in memory
            const snapshot = await ticketsRef.get();
            
            let rawTickets = snapshot.docs.map(doc => doc.data());
            
            // Priority ordering: high > normal > low
            const priorityWeight = { high: 3, normal: 2, low: 1 };
            
            rawTickets.sort((a, b) => {
                const wA = priorityWeight[a.priority] || 0;
                const wB = priorityWeight[b.priority] || 0;
                if (wA !== wB) return wB - wA;
                return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
            });
            
            const tickets = await Promise.all(rawTickets.map(async ticket => {
                if (ticket.user_id) {
                    const userDoc = await usersRef.doc(String(ticket.user_id)).get();
                    if (userDoc.exists) {
                        ticket.user = { display_name: userDoc.data().display_name, avatar: userDoc.data().avatar };
                    }
                }
                return ticket;
            }));
            res.json({ success: true, data: tickets });
        } catch (error) {
            console.error('Error fetching admin tickets:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
};

module.exports = supportController;
