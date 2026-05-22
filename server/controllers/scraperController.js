const { News, Notification, User } = require('../models');

exports.postJob = async (req, res) => {
    try {
        const { title, content, summary, image_url, pdf_url, external_link, keywords, source_memo, agency, metadata, end_date } = req.body;

        // Check if job already exists by external_link if provided
        if (external_link) {
            const existingJob = await News.findOne({ where: { external_link } });
            if (existingJob) {
                // Update existing job
                await existingJob.update({
                    title,
                    content,
                    summary,
                    image_url,
                    pdf_url,
                    keywords,
                    source_memo,
                    agency,
                    metadata,
                    end_date,
                    // Optionally update more fields
                });
                return res.json({ success: true, message: 'Job updated', data: existingJob });
            }
        }

        const newJob = await News.create({
            title,
            content,
            summary,
            category: 'งานราชการ',
            image_url,
            pdf_url,
            external_link,
            keywords,
            source_memo,
            agency,
            metadata,
            end_date,
            is_featured: false,
            published_at: new Date()
        });

        res.status(201).json({ success: true, message: 'Job created', data: newJob });
    } catch (error) {
        console.error('Error in postJob:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.postAlert = async (req, res) => {
    try {
        const { message, type = 'system' } = req.body;

        // Find all admin users to notify
        const admins = await User.findAll({ where: { role: 'admin' } });

        const notifications = admins.map(admin => ({
            user_id: admin.id,
            type: type,
            message: message,
            is_read: false
        }));

        await Notification.bulkCreate(notifications);

        res.json({ success: true, message: `Alert sent to ${admins.length} admins` });
    } catch (error) {
        console.error('Error in postAlert:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
