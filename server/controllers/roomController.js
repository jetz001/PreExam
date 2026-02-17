const { Room, RoomParticipant, User, Question, sequelize, Sequelize } = require('../models');
const { v4: uuidv4 } = require('uuid');

exports.createRoom = async (req, res) => {
    try {
        const { name, mode, subject, category, max_participants, question_count, time_limit, password } = req.body;

        // Prevent guests from creating rooms
        if (req.user.email && req.user.email.startsWith('guest_')) {
            return res.status(403).json({ success: false, message: 'Guests cannot create rooms. Please register to create a room.' });
        }

        // Generate a simple 6-character code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Validate max_participants
        const limitParticipants = max_participants ? Math.min(parseInt(max_participants), 20) : 20;

        // Fetch random questions
        const questions = await Question.findAll({
            where: {
                subject: subject || 'thai',
                ...(category && category !== 'Any Category' ? {
                    [Sequelize.Op.or]: [
                        { category: { [Sequelize.Op.like]: `%${category}%` } },
                        { catalogs: { [Sequelize.Op.like]: `%${category}%` } }
                    ]
                } : {})
            },
            order: [sequelize.literal('RANDOM()')],
            limit: question_count || 20,
            attributes: ['id']
        });
        const questionIds = questions.map(q => q.id);

        let theme = req.body.theme || null;
        if (theme && req.user.plan_type !== 'premium') {
            theme = null;
        }

        const room = await Room.create({
            code,
            name,
            mode,
            host_user_id: req.user.id,
            subject,
            category,
            max_participants: limitParticipants,
            question_count: question_count || 20,
            status: 'waiting',
            question_ids: questionIds,
            settings: {
                time_limit: time_limit ? Math.max(5, Math.min(parseInt(time_limit), 60)) : 60
            },
            password: password || null,
            theme
        });

        // Add host as participant
        await RoomParticipant.create({
            room_id: room.id,
            user_id: req.user.id,
            status: 'joined'
        });

        res.status(201).json({ success: true, data: room });
    } catch (error) {
        console.error('Create Room Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getRooms = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const oneDayAgo = new Date(new Date() - 24 * 60 * 60 * 1000);

        const { count, rows } = await Room.findAndCountAll({
            where: {
                [Op.or]: [
                    { status: ['waiting', 'in_progress'] },
                    {
                        status: 'finished',
                        updated_at: { [Op.gte]: oneDayAgo }
                    }
                ]
            },
            include: [
                { model: User, as: 'Host', attributes: ['display_name', 'plan_type'] },
                { model: RoomParticipant } // To count participants
            ],
            order: [['created_at', 'DESC']],
            attributes: { exclude: ['password'] },
            limit,
            offset,
            distinct: true // Important for correct count with includes
        });

        // Transform data to include participant count
        const data = rows.map(room => ({
            ...room.toJSON(),
            participant_count: room.RoomParticipants.length
        }));

        res.json({
            success: true,
            data,
            pagination: {
                total: count,
                page,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get Rooms Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.joinRoom = async (req, res) => {
    try {
        const { code, password } = req.body;
        const room = await Room.findOne({ where: { code } });

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        // Check password if room has one
        if (room.password) {
            if (!password) {
                return res.status(403).json({ success: false, message: 'Password required', requirePassword: true });
            }
            if (room.password !== password) {
                return res.status(403).json({ success: false, message: 'Invalid password' });
            }
        }

        // Check if already joined
        const existing = await RoomParticipant.findOne({
            where: { room_id: room.id, user_id: req.user.id }
        });

        if (existing) {
            return res.json({ success: true, data: room });
        }

        // If not joined, check status
        if (room.status !== 'waiting') {
            return res.status(400).json({ success: false, message: 'Room is already in progress or finished' });
        }

        await RoomParticipant.create({
            room_id: room.id,
            user_id: req.user.id,
            status: 'joined'
        });

        res.json({ success: true, data: room });
    } catch (error) {
        console.error('Join Room Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findByPk(id, {
            include: [
                { model: User, as: 'Host', attributes: ['display_name', 'id'] },
                {
                    model: RoomParticipant,
                    include: [{ model: User, attributes: ['display_name', 'public_id'] }]
                }
            ]
        });

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        // Fetch questions if they exist
        let questions = [];
        if (room.question_ids && room.question_ids.length > 0) {
            questions = await Question.findAll({
                where: { id: room.question_ids }
            });
            // Re-order based on the array order (optional, but good for consistency)
            // For now, just return them
        }

        res.json({ success: true, data: { ...room.toJSON(), questions } });
    } catch (error) {
        console.error('Get Room Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findByPk(id);

        if (!room) {
            // Idempotency: If room is already gone, consider it a success for "Force Close"
            return res.json({ success: true, message: 'Room already deleted or not found' });
        }

        // Check ownership or admin role
        if (room.host_user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this room' });
        }

        // Delete (Cascade deletion of RoomParticipants should be handled by DB constraints or Sequelize hooks if configured, keeping it simple here)
        // If RoomParticipants doesn't have onDelete CASCADE, we might need to delete them manually.
        // Let's assume manual deletion for safety if cascade isn't guaranteed.
        await RoomParticipant.destroy({ where: { room_id: id } });
        await room.destroy();

        res.json({ success: true, message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Delete Room Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
