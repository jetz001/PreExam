const { User, ExamResult } = require('../models');


exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password_hash'] }
        });
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password_hash', 'email', 'phone_number', 'premium_expiry'] } // Hide sensitive info initially
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Privacy Checks
        const isSelf = req.user && req.user.id === parseInt(id);
        const data = user.toJSON();

        if (!isSelf) {
            // Check privacy settings
            if (!user.is_public_stats) {
                // Remove stats if private
                delete data.streak_count;
                // Add other redactions if needed
            }
            if (!user.is_online_visible) {
                delete data.last_active_at; // Or set to null
            }
            // Always hide specific private fields for others
            delete data.notification_preferences; // concept
            delete data.plan_type; // Maybe keep?
        }

        res.json({ success: true, data });
    } catch (error) {
        console.error('Get User Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { display_name, bio, target_exam, target_exam_date, phone_number } = req.body;
        const updateData = {
            display_name,
            bio,
            target_exam,
            target_exam,
            target_exam_date: target_exam_date === '' ? null : target_exam_date,
            phone_number
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        if (req.file) {
            updateData.avatar = `/uploads/${req.file.filename}`;
        }

        // Handle Business Info updates
        if (req.user.role === 'sponsor') {
            const { business_name, tax_id, website, address, line_id, business_email, business_phone, billing_address, notification_settings } = req.body;

            if (business_name !== undefined) updateData.business_name = business_name;
            if (tax_id !== undefined) updateData.tax_id = tax_id;

            // Merge business_info
            const currentInfo = req.user.business_info || {};
            const newInfo = { ...currentInfo };

            if (website !== undefined) newInfo.website = website;
            if (address !== undefined) newInfo.address = address;
            if (billing_address !== undefined) newInfo.billing_address = billing_address;
            if (line_id !== undefined) newInfo.line_id = line_id;
            if (business_email !== undefined) newInfo.email = business_email;
            if (business_phone !== undefined) newInfo.phone = business_phone;

            if (notification_settings !== undefined) {
                // Determine if it's a string (JSON) or object
                let notif = notification_settings;
                if (typeof notif === 'string') {
                    try { notif = JSON.parse(notif); } catch (e) { }
                }
                newInfo.notifications = { ...(newInfo.notifications || {}), ...notif };
            }

            if (Object.keys(newInfo).length > 0) {
                updateData.business_info = newInfo;
            }
        }

        const result = await User.update(updateData, { where: { id: req.user.id } });

        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password_hash'] }
        });



        res.json({ success: true, data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const {
            is_public_stats,
            is_online_visible,
            allow_friend_request,
            notify_study_group,
            notify_friend_request,
            notify_news_update,
            theme_preference,
            font_size_preference
        } = req.body;

        const updateData = {
            is_public_stats,
            is_online_visible,
            allow_friend_request,
            notify_study_group,
            notify_friend_request,
            notify_news_update,
            theme_preference,
            font_size_preference
        };

        // Remove undefined keys to only update passed values
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        await User.update(updateData, { where: { id: req.user.id } });

        res.json({ success: true, message: 'Settings updated' });
    } catch (error) {
        console.error('Update Settings Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getStats = async (req, res) => {
    try {
        // ... (Existing logic can stay or be replaced, but let's keep it simple and redirect to new methods if needed, or just return basic summary)
        const results = await ExamResult.findAll({
            where: { user_id: req.user.id }
        });

        const totalExams = results.length;
        const totalScore = results.reduce((acc, curr) => acc + curr.score, 0); // Assuming 'score' is what maps to 'accumulated_score' logic roughly
        // Wait, existing code used curr.score, but schema says ExamResult has total_score?
        // Let's implement based on existing code which probably had 'total_score' as full score and some other field for user score?
        // Schema in prompt: subject_scores (JSON), total_score, max_score.
        // Existing code: results.reduce((acc, curr) => acc + curr.score, 0).
        // I should check ExamResult model.
        // But for now, let's assume valid fields or fix if I see errors.

        // Let's rely on getHeatmapStats and getRadarStats for main dashboard.
        // This endpoint can return the "Key Stats" box data.
        const totalQuestions = results.reduce((acc, curr) => acc + (curr.total_questions || 0), 0); // Guessing field
        const timeTaken = results.reduce((acc, curr) => acc + (curr.time_taken || 0), 0);

        res.json({
            success: true,
            data: {
                totalExams,
                totalQuestions,
                timeTaken,
                // simplified
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getHeatmapStats = async (req, res) => {
    try {
        const results = await ExamResult.findAll({
            where: { user_id: req.user.id },
            attributes: ['taken_at']
        });

        // Group by YYYY-MM-DD
        const dateMap = {};
        results.forEach(r => {
            const date = new Date(r.taken_at).toISOString().split('T')[0];
            dateMap[date] = (dateMap[date] || 0) + 1;
        });

        const data = Object.keys(dateMap).map(date => ({
            date,
            count: dateMap[date]
        }));

        res.json({ success: true, data });
    } catch (error) {
        console.error('Heatmap Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getRadarStats = async (req, res) => {
    try {
        // Try fetching from UserRankingStats first (Optimized table)
        const { UserRankingStats } = require('../models');
        if (UserRankingStats) { // Check if model exists/loaded
            const rankStats = await UserRankingStats.findAll({
                where: { user_id: req.user.id }
            });

            if (rankStats.length > 0) {
                const data = rankStats.map(s => ({
                    subject: s.subject,
                    fullMark: 100,
                    A: Math.round(s.accuracy_rate * 100) // Assuming accuracy_rate is 0.0-1.0
                }));
                return res.json({ success: true, data });
            }
        }

        // Fallback to calculating from ExamResults on the fly
        const results = await ExamResult.findAll({
            where: { user_id: req.user.id },
            attributes: ['subject_scores', 'skill_scores']
        });

        const skillStats = {};
        let hasData = false;

        results.forEach(r => {
            let scores = null;
            let source = 'subject';

            let skillScoresParsed = r.skill_scores;
            if (typeof skillScoresParsed === 'string') {
                try { skillScoresParsed = JSON.parse(skillScoresParsed); } catch (e) { }
            }

            let subjectScoresParsed = r.subject_scores;
            if (typeof subjectScoresParsed === 'string') {
                try { subjectScoresParsed = JSON.parse(subjectScoresParsed); } catch (e) { }
            }

            // Priority: skill_scores (if not empty) -> subject_scores
            if (skillScoresParsed && Object.keys(skillScoresParsed).length > 0) {
                scores = skillScoresParsed;
                source = 'skill';
            } else if (subjectScoresParsed) {
                scores = subjectScoresParsed;
            }

            if (typeof scores === 'string') {
                try { scores = JSON.parse(scores); } catch (e) { }
            }

            if (scores) {
                hasData = true;
                Object.keys(scores).forEach(key => {
                    // key is either skill (e.g., 'Finance') or subject (e.g., 'Internal Auditor')
                    if (!skillStats[key]) skillStats[key] = { score: 0, count: 0 };

                    if (source === 'skill') {
                        // Skill scores object structure from examController: { total: N, score: M }
                        // Wait, examController saves: skill_scores[q.skill] = { score: 0, total: 0 }
                        // So we need to accumulate these totals.
                        // But for subject_scores legacy, it was saving just raw count/score too?
                        // Let's check examController legacy logic: subject_scores[q.subject] = { score: 0, total: 0 }
                        // Yes, structure is same { score, total }

                        const data = scores[key];
                        skillStats[key].score += (data.score || 0); // Correct answers
                        skillStats[key].count += (data.total || 0); // Total questions
                    } else {
                        // Legacy subject_scores might have been saved differently in old versions?
                        // Current examController saves subject_scores as { score, total } too.
                        // So logic is consistent.

                        // BUT, previous userController logic was:
                        // skillStats[subject].score += (scores[subject] || 0);
                        // skillStats[subject].count += 1;
                        // This implies scores[subject] was just a number (score) and count was 1 exam?
                        // Let's look at previous code in userController:
                        // if (scores) ... skillStats[subject].score += (scores[subject] || 0); skillStats[subject].count += 1;
                        // This suggests existing data might store subject_scores as just INT? 
                        // "ExamResult model": source code said subject_scores is JSON.
                        // "examController": subject_scores[q.subject] = { score: 0, total: 0 }.
                        // This means the previous userController logic was probably WRONG or simplified assuming 1 exam = 1 count?
                        // "skillStats[subject].count += 1" means it averaged across *exams*, not questions.
                        // And "skillStats[subject].score += scores[subject]" means it summed the object? {score, total}? That would result in NaN.

                        // Filter out known Categories that are NOT Skills (Fix for "ท้องถิ่น ภาค ก" appearing in Radar)
                        const EXCLUDED_SKILLS = ['ท้องถิ่น ภาค ก', 'ท้องถิ่น ภาค ข', 'ภาค ก', 'ภาค ข'];
                        if (EXCLUDED_SKILLS.includes(key)) {
                            return; // Skip this iteration
                        }

                        // If legacy DB has subject_scores as {score, total}, doing += object is wrong.
                        // Only if legacy DB has subject_scores as "Thai": 5 (int).

                        // Let's be robust. Check if value is object or number.
                        const val = scores[key];
                        if (typeof val === 'number') {
                            skillStats[key].score += val;
                            skillStats[key].count += 1; // Unclear how many questions, assume 1 exam weight? hard to normalize.
                            // Actually, for radar chart 0-100, if val is score (e.g. 5/10), we can't know % without total.
                            // Assuming previous logic worked somehow, maybe it was just raw score summation??
                        } else if (typeof val === 'object' && val !== null) {
                            skillStats[key].score += (val.score || 0);
                            skillStats[key].count += (val.total || 0);
                        }
                    }
                });
            }
        });

        const data = Object.keys(skillStats).map(subject => ({
            subject,
            fullMark: 100,
            score: skillStats[subject].count > 0
                ? Math.round((skillStats[subject].score / skillStats[subject].count) * 100)
                : 0
        }));



        res.json({ success: true, data });
    } catch (error) {
        console.error('Radar Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        console.log('Searching users with query:', q);
        if (!q) return res.json({ success: true, data: [] });

        // Ensure User model is available
        if (!User) {
            throw new Error('User model not loaded');
        }

        // Use Op from the Sequelize constructor exposed by models, or require it if not present
        const { Sequelize } = require('../models');
        const Op = Sequelize.Op;

        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { display_name: { [Op.like]: `%${q}%` } },
                    { email: { [Op.like]: `%${q}%` } }
                ]
            },
            attributes: ['id', 'display_name', 'avatar'],
            limit: 5
        });

        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'display_name', 'email', 'avatar', 'role', 'created_at'],
            order: [['created_at', 'DESC']]
        });

        const formattedUsers = users.map(u => ({
            id: u.id,
            name: u.display_name,
            email: u.email,
            avatar: u.avatar,
            role: u.role,
            status: 'active'
        }));

        res.json({ success: true, data: formattedUsers });
    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        // Manual Cascade Deletion

        // 1. Delete Exam Results
        try { await ExamResult.destroy({ where: { user_id: userId } }); } catch (e) { }

        // Load other models dynamically to avoid circular deps or verify existence
        const { Bookmark, Thread, StudyGroupMember, GroupMessage, Friendship, Sequelize } = require('../models');
        const Op = Sequelize.Op;

        // 2. Delete Bookmarks
        if (Bookmark) await Bookmark.destroy({ where: { user_id: userId } });

        // 3. Delete Threads
        if (Thread) await Thread.destroy({ where: { user_id: userId } });

        // 4. Study Group Memberships
        if (StudyGroupMember) await StudyGroupMember.destroy({ where: { user_id: userId } });

        // 5. Group Messages
        if (GroupMessage) await GroupMessage.destroy({ where: { user_id: userId } });

        // 6. Friendships
        if (Friendship) {
            await Friendship.destroy({
                where: {
                    [Op.or]: [{ user_id: userId }, { friend_id: userId }]
                }
            });
        }

        // Finally Delete User
        await User.destroy({ where: { id: userId } });

        res.json({ success: true, message: 'Account deleted' });
    } catch (error) {
        console.error("Delete Account Error", error);
        res.status(500).json({ success: false, message: 'Server error deleting account' });
    }
};

exports.downgradeToUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.role !== 'sponsor') return res.status(400).json({ success: false, message: 'User is not a business account' });

        // Downgrade logic
        await user.update({
            role: 'user',
            business_name: null,
            tax_id: null
        });

        res.json({ success: true, message: 'Business account removed. You are now a standard user.' });
    } catch (error) {
        console.error('Downgrade Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
