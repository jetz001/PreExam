const { RoomAsset } = require('../models');

exports.getAssets = async (req, res) => {
    try {
        const { type } = req.query;
        const where = {};
        if (type) where.type = type;

        const assets = await RoomAsset.findAll({ where });
        res.json({ success: true, data: assets });
    } catch (error) {
        console.error('Get Assets Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createAsset = async (req, res) => {
    try {
        const { type, name, is_premium } = req.body;
        let url = req.body.url;

        if (req.file) {
            // Construct relative URL from uploaded file
            // Storing relative path allows the frontend to construct the full URL based on its network location
            url = `/uploads/${req.file.filename}`;
        }

        const asset = await RoomAsset.create({
            type,
            name,
            url,
            is_premium: is_premium === 'true' || is_premium === true, // Handle string 'true' from FormData
        });

        res.status(201).json({ success: true, data: asset });
    } catch (error) {
        console.error('Create Asset Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteAsset = async (req, res) => {
    try {
        const { id } = req.params;
        await RoomAsset.destroy({ where: { id } });
        res.json({ success: true, message: 'Asset deleted' });
    } catch (error) {
        console.error('Delete Asset Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
