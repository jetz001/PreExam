const { SupportTicket, SupportMessage, User } = require('../models');
const { Op } = require('sequelize');

const supportController = {
    // User: Create Ticket
    createTicket: async (req, res) => {
        try {
            const { category, subject, description, device_info, context_data } = req.body;
            const user = await User.findByPk(req.user.id);

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Determine Priority and Tier
            const user_tier = user.plan_type === 'premium' ? 'premium' : (user.role === 'sponsor' ? 'sponsor' : 'free');
            const priority = user_tier !== 'free' ? 'high' : 'normal';

            const ticket = await SupportTicket.create({
                user_id: user.id,
                user_tier,
                category,
                subject,
                description,
                priority,
                device_info,
                context_data,
                status: 'open'
            });

            // Initial message from user
            await SupportMessage.create({
                ticket_id: ticket.id,
                sender_id: user.id,
                role: 'user',
                message: description
            });

            // Auto-Reply Logic (22:00 - 08:00)
            const now = new Date();
            const hour = now.getHours();
            if (hour >= 22 || hour < 8) {
                await SupportMessage.create({
                    ticket_id: ticket.id,
                    sender_id: 1, // System/Admin ID (assuming 1 is admin)
                    role: 'system',
                    message: "ได้รับเรื่องแล้ว จะรีบดำเนินการในเวลาทำการ (08:00 - 22:00 น.)"
                });
            }

            // Emit to admin via socket if needed
            const io = req.app.get('io');
            io.emit('new_ticket', { ticket_id: ticket.id, category, user_tier });

            res.status(201).json({ success: true, data: ticket });
        } catch (error) {
            console.error('Error creating ticket:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    // User: Get My Tickets
    getMyTickets: async (req, res) => {
        try {
            const tickets = await SupportTicket.findAll({
                where: { user_id: req.user.id },
                order: [['created_at', 'DESC']]
            });
            res.json({ success: true, data: tickets });
        } catch (error) {
            console.error('Error fetching tickets:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    // Get Ticket Details (Admin or Owner)
    getTicketDetails: async (req, res) => {
        try {
            const ticket = await SupportTicket.findByPk(req.params.id, {
                include: [
                    { model: User, as: 'user', attributes: ['id', 'display_name', 'email', 'avatar', 'role', 'plan_type'] },
                    {
                        model: SupportMessage,
                        as: 'messages',
                        include: [{ model: User, as: 'sender', attributes: ['id', 'display_name', 'avatar', 'role'] }]
                    }
                ],
                order: [[{ model: SupportMessage, as: 'messages' }, 'created_at', 'ASC']]
            });

            if (!ticket) {
                return res.status(404).json({ success: false, message: 'Ticket not found' });
            }

            // Check authorization
            if (req.user.role !== 'admin' && ticket.user_id !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }

            res.json({ success: true, data: ticket });
        } catch (error) {
            console.error('Error fetching ticket details:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    // Send Message
    sendMessage: async (req, res) => {
        try {
            const { message, attachments, is_internal_note } = req.body;
            const ticket = await SupportTicket.findByPk(req.params.id);

            if (!ticket) {
                return res.status(404).json({ success: false, message: 'Ticket not found' });
            }

            // Check authorization
            if (req.user.role !== 'admin' && ticket.user_id !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }

            const senderRole = req.user.role === 'admin' ? 'admin' : 'user';

            const newMessage = await SupportMessage.create({
                ticket_id: ticket.id,
                sender_id: req.user.id,
                role: senderRole,
                message,
                attachments,
                is_internal_note: req.user.role === 'admin' ? is_internal_note : false
            });

            // Update ticket status if admin replies
            if (senderRole === 'admin' && ticket.status === 'open' && !is_internal_note) {
                ticket.status = 'in_progress';
                await ticket.save();
            }

            // Notify via Socket
            const io = req.app.get('io');
            const roomName = `ticket_${ticket.id}`;
            io.to(roomName).emit('new_message', newMessage);

            res.status(201).json({ success: true, data: newMessage });
        } catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    // Update Status
    updateStatus: async (req, res) => {
        try {
            const { status } = req.body;
            const ticket = await SupportTicket.findByPk(req.params.id);

            if (!ticket) {
                return res.status(404).json({ success: false, message: 'Ticket not found' });
            }

            // Authorization
            if (req.user.role !== 'admin') {
                // User can only mark as resolved or close their own ticket
                if (ticket.user_id !== req.user.id || !['resolved', 'closed'].includes(status)) {
                    return res.status(403).json({ success: false, message: 'Unauthorized' });
                }
            }

            ticket.status = status;
            await ticket.save();

            // Notify via Socket
            const io = req.app.get('io');
            io.to(`ticket_${ticket.id}`).emit('status_updated', { ticket_id: ticket.id, status });

            res.json({ success: true, message: `Ticket status updated to ${status}` });
        } catch (error) {
            console.error('Error updating status:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    // Admin: Get All Tickets (Kanban)
    getAllTickets: async (req, res) => {
        try {
            // Basic optimization: can use separate calls for each status or group here
            const tickets = await SupportTicket.findAll({
                include: [{ model: User, as: 'user', attributes: ['display_name', 'avatar'] }],
                order: [
                    ['priority', 'DESC'],
                    ['updated_at', 'DESC']
                ]
            });
            res.json({ success: true, data: tickets });
        } catch (error) {
            console.error('Error fetching admin tickets:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
};

module.exports = supportController;
