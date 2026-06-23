const { ArcadeGame } = require('../models');

exports.getAllGames = async (req, res) => {
    try {
        const games = await ArcadeGame.findAll({
            order: [['order_index', 'ASC'], ['created_at', 'DESC']]
        });
        res.json({ success: true, data: games });
    } catch (err) {
        console.error('Error fetching arcade games:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.createGame = async (req, res) => {
    try {
        const { title, description, thumbnail_url, game_url, internal_component, mode, is_active, order_index } = req.body;
        const newGame = await ArcadeGame.create({
            title, description, thumbnail_url, game_url, internal_component, mode, is_active, order_index
        });
        res.status(201).json({ success: true, data: newGame });
    } catch (err) {
        console.error('Error creating arcade game:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateGame = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const game = await ArcadeGame.findByPk(id);
        if (!game) return res.status(404).json({ success: false, message: 'Game not found' });
        
        await game.update(updates);
        res.json({ success: true, data: game });
    } catch (err) {
        console.error('Error updating arcade game:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.deleteGame = async (req, res) => {
    try {
        const { id } = req.params;
        const game = await ArcadeGame.findByPk(id);
        if (!game) return res.status(404).json({ success: false, message: 'Game not found' });
        
        await game.destroy();
        res.json({ success: true, message: 'Game deleted' });
    } catch (err) {
        console.error('Error deleting arcade game:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
