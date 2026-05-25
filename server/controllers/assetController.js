const { db: firestore } = require('../config/firebase');
const assetsRef = firestore.collection('room_assets');

exports.getAssets = async (req, res) => {
    try {
        const { type } = req.query;
        let snapshot;
        
        if (type) {
            snapshot = await assetsRef.where('type', '==', type).get();
        } else {
            snapshot = await assetsRef.get();
        }

        const assets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

        const newAssetRef = assetsRef.doc();
        const assetData = {
            type: type || 'background',
            name: name || 'Unnamed Asset',
            url: url || '',
            is_premium: is_premium === 'true' || is_premium === true, // Handle string 'true' from FormData
            created_at: new Date().toISOString()
        };

        await newAssetRef.set(assetData);

        res.status(201).json({ success: true, data: { id: newAssetRef.id, ...assetData } });
    } catch (error) {
        console.error('Create Asset Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteAsset = async (req, res) => {
    try {
        const { id } = req.params;
        await assetsRef.doc(String(id)).delete();
        res.json({ success: true, message: 'Asset deleted' });
    } catch (error) {
        console.error('Delete Asset Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
