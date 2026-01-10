const { ExamResult, Question } = require('../models');

exports.submitExam = async (req, res) => {
    try {
        const { answers, mode, classroom_id, total_time } = req.body;
        // answers: { questionId: 'A', ... }

        let score = 0;
        let total_score = 0;
        const subject_scores = {};
        const skill_scores = {}; // New Skill Aggregation

        const questionIds = Object.keys(answers);
        const questions = await Question.findAll({
            where: { id: questionIds }
        });

        const questionsDetail = [];

        questions.forEach(q => {
            total_score++;
            const userAnswer = answers[q.id];
            // Normalize correct answer comparison (case-insensitive and trimmed)
            const correctNormalized = q.correct_answer ? q.correct_answer.toString().trim().toLowerCase() : '';
            const userNormalized = userAnswer ? userAnswer.toString().trim().toLowerCase() : '';
            const isCorrect = userNormalized === correctNormalized;

            if (isCorrect) score++;

            // Subject breakdown
            if (!subject_scores[q.subject]) {
                subject_scores[q.subject] = { score: 0, total: 0 };
            }
            subject_scores[q.subject].total++;
            if (isCorrect) subject_scores[q.subject].score++;

            // Skill breakdown (Radar Chart)
            if (q.skill) {
                if (!skill_scores[q.skill]) {
                    skill_scores[q.skill] = { score: 0, total: 0 };
                }
                skill_scores[q.skill].total++;
                if (isCorrect) skill_scores[q.skill].score++;
            }

            // Add detailed result
            questionsDetail.push({
                question_id: q.id,
                question_text: q.question_text,
                user_answer: userAnswer,
                correct_answer: q.correct_answer,
                is_correct: isCorrect,
                explanation: q.explanation,
                choice_a: q.choice_a,
                choice_b: q.choice_b,
                choice_c: q.choice_c,
                choice_d: q.choice_d,
                category: q.category,
                subject: q.subject,
                skill: q.skill // Include skill in detail
            });
        });

        const examResult = await ExamResult.create({
            user_id: req.user.id,
            classroom_id: classroom_id || null,
            score,
            total_score,
            mode,
            subject_scores,
            skill_scores, // Save new field
            questions: questionsDetail,
            time_taken: total_time || 0,
        });

        // Update User Streak & Last Active
        const { User } = require('../models');
        const user = await User.findByPk(req.user.id);

        if (user) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const lastActive = user.last_active_at ? new Date(user.last_active_at) : null;
            if (lastActive) lastActive.setHours(0, 0, 0, 0);

            let newStreak = user.streak_count || 0;

            if (!lastActive) {
                // First time
                newStreak = 1;
            } else if (today.getTime() === lastActive.getTime()) {
                // Same day, keep streak
            } else if (today.getTime() - lastActive.getTime() === 86400000) {
                // Consecutive day
                newStreak += 1;
            } else {
                // Streak broken
                newStreak = 1;
            }

            await user.update({
                streak_count: newStreak,
                last_active_at: new Date()
            });
        }

        res.status(201).json({ success: true, data: examResult });
    } catch (error) {
        console.error('Error submitting exam:', error);
        console.error('Request body:', req.body);
        console.error('User:', req.user);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.getExamResults = async (req, res) => {
    try {
        const results = await ExamResult.findAll({
            where: { user_id: req.user.id },
            order: [['taken_at', 'DESC']]
        });
        res.json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getExamResultById = async (req, res) => {
    try {
        const result = await ExamResult.findByPk(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: 'Result not found' });
        if (result.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
