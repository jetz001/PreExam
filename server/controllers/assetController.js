const { db: firestore } = require('../config/firebase');
const { uploadFileToR2, deleteFileFromR2 } = require('../services/r2Service');
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
            // Upload to Cloudflare R2
            url = await uploadFileToR2(req.file.buffer, req.file.originalname, req.file.mimetype);
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
        const assetDoc = await assetsRef.doc(String(id)).get();
        
        if (assetDoc.exists) {
            const assetData = assetDoc.data();
            if (assetData.url) {
                // Delete from R2 if it's an R2 URL
                await deleteFileFromR2(assetData.url);
            }
            await assetsRef.doc(String(id)).delete();
        }
        
        res.json({ success: true, message: 'Asset deleted' });
    } catch (error) {
        console.error('Delete Asset Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
