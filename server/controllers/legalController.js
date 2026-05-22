const { SystemSetting } = require('../models');

// Key for Privacy Policy in SystemSettings
const SETTING_KEY_PRIVACY_POLICY = 'privacy_policy_content';

exports.getPrivacyPolicy = async (req, res) => {
    try {
        const setting = await SystemSetting.findByPk(SETTING_KEY_PRIVACY_POLICY);
        if (!setting) {
            // Return empty or null if not set, frontend handles default
            return res.status(200).json({ content: null });
        }
        res.status(200).json({ content: setting.value });
    } catch (error) {
        console.error('Error fetching privacy policy:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updatePrivacyPolicy = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const [setting, created] = await SystemSetting.findOrCreate({
            where: { key: SETTING_KEY_PRIVACY_POLICY },
            defaults: { value: content }
        });

        if (!created) {
            setting.value = content;
            await setting.save();
        }

        res.status(200).json({ message: 'Privacy policy updated successfully', content: setting.value });
    } catch (error) {
        console.error('Error updating privacy policy:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
