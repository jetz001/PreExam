const { QuestionReport } = require('../models');

exports.createReport = async (req, res) => {
    try {
        const { question_id, reason } = req.body;

        if (!question_id || !reason) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const report = await QuestionReport.create({
            user_id: req.user.id,
            question_id,
            reason,
            status: 'pending'
        });

        res.status(201).json({ success: true, data: report, message: 'Report submitted successfully' });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
