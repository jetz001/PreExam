const { ReportedContent } = require('../models');

exports.reportContent = async (req, res) => {
    try {
        const { target_type, target_id, reason } = req.body;
        const reporter_id = req.user.id;

        const report = await ReportedContent.create({
            reporter_id,
            target_type,
            target_id,
            reason,
        });

        res.status(201).json({ message: 'Content reported successfully', report });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error reporting content' });
    }
};
