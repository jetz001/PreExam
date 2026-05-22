const express = require('express');
const router = express.Router();
const { Question, Notification, User, News } = require('../models');
const dotenv = require('dotenv');

dotenv.config();

// Middleware to check specific API key for the generator
const checkGeneratorKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validKey = process.env.GENERATOR_API_KEY || process.env.SCRAPER_API_KEY || "your-fallback-secret-key";
    
    if (!apiKey || apiKey !== validKey) {
        return res.status(403).json({ error: "Forbidden: Invalid API Key" });
    }
    next();
};

/**
 * POST /api/generator/exam
 * Receives the generated Exam JSON and inserts it into the database.
 */
router.post('/exam', checkGeneratorKey, async (req, res) => {
    try {
        const data = req.body;
        
        // Basic validation
        if (!data.question_text || !data.correct_answer || !data.exam_set) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        
        // Map correct_answer from "Option A" to "A"
        let answerEnum = "A";
        if (data.correct_answer.includes("B")) answerEnum = "B";
        if (data.correct_answer.includes("C")) answerEnum = "C";
        if (data.correct_answer.includes("D")) answerEnum = "D";

        const newQuestion = await Question.create({
            question_text: data.question_text,
            choice_a: data.option_a,
            choice_b: data.option_b,
            choice_c: data.option_c,
            choice_d: data.option_d,
            correct_answer: answerEnum,
            explanation: data.explanation,
            subject: data.subject || "วิชาทั่วไป",
            skill: data.skill || "ความรู้ทั่วไป",
            catalogs: data.catalogs ? [data.catalogs] : [],
            category: "local_gov", // fallback category
            exam_set: data.exam_set,
            exam_year: "Mockup 2569" // We map the string into year if needed, but exam_year is INTEGER in schema. Let's extract the year or pass null, schema allows integer. Let's just set it to 2569.
        });
        
        res.status(201).json({ 
            success: true, 
            message: "Exam generated successfully into Question Bank",
            id: newQuestion.id
        });
        
    } catch (err) {
        console.error("Generator Exam error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * POST /api/generator/inbox
 * Sends a system alert/notification to Admin inbox.
 */
router.post('/inbox', checkGeneratorKey, async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: "Missing message body" });
        }

        // Find all admin users to notify
        const admins = await User.findAll({ where: { role: 'admin' } });

        const notifications = admins.map(admin => ({
            user_id: admin.id,
            type: "system_alert",
            message: message,
            is_read: false
        }));

        await Notification.bulkCreate(notifications);
        
        res.status(201).json({ success: true, message: `Alert sent to ${admins.length} admins` });
        
    } catch (err) {
        console.error("Generator Inbox error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
