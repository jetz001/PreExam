const { db: firestore } = require('../config/firebase');

const settingsRef = firestore.collection('system_settings');
const SETTING_KEY_PRIVACY_POLICY = 'privacy_policy_content';

exports.getPrivacyPolicy = async (req, res) => {
    try {
        const doc = await settingsRef.doc(SETTING_KEY_PRIVACY_POLICY).get();
        if (!doc.exists) {
            return res.status(200).json({ content: null });
        }
        res.status(200).json({ content: doc.data().value });
    } catch (error) {
        console.error('Error fetching privacy policy:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updatePrivacyPolicy = async (req, res) => {
    try {
        const { content } = req.body;

        if (content === undefined) {
            return res.status(400).json({ message: 'Content is required' });
        }

        await settingsRef.doc(SETTING_KEY_PRIVACY_POLICY).set({
            value: content,
            updated_at: new Date().toISOString()
        }, { merge: true });

        res.status(200).json({ message: 'Privacy policy updated successfully', content });
    } catch (error) {
        console.error('Error updating privacy policy:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
