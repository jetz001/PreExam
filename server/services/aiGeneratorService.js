const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { OpenAI } = require('openai');
const { Question, Notification, User } = require('../models');

const EXAM_GEN_DIR = path.resolve(__dirname, '../../exam-generator');
const DB_PATH = path.join(EXAM_GEN_DIR, 'exams.db');
const LOG_FILE = path.join(EXAM_GEN_DIR, 'generator.log');

const logToFile = (message, level = 'INFO') => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 23);
    const logMessage = `${timestamp} - ${level} - ${message}\n`;
    fs.appendFileSync(LOG_FILE, logMessage, 'utf8');
    if (level === 'ERROR') {
        console.error(`generator> ${message}`);
    } else {
        console.log(`generator> ${message}`);
    }
};

const getDbConnection = () => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) reject(err);
            else resolve(db);
        });
    });
};

const getNextCategory = async (db) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT id, name FROM categories WHERE name NOT LIKE '%ข้อสอบจริง%' AND name NOT LIKE '%Past Exam%' ORDER BY id ASC", (err, validCategories) => {
            if (err) return reject(err);
            if (!validCategories || validCategories.length === 0) return reject(new Error("No valid categories found"));

            db.get("SELECT last_category_index FROM rotation WHERE id = 1", (err, row) => {
                if (err) return reject(err);
                const lastIndex = row ? row.last_category_index : -1;
                const nextIndex = (lastIndex + 1) % validCategories.length;
                const nextCategory = validCategories[nextIndex];

                db.run("UPDATE rotation SET last_category_index = ? WHERE id = 1", [nextIndex], (err) => {
                    if (err) return reject(err);
                    resolve(nextCategory.name);
                });
            });
        });
    });
};

const getPreviousQuestions = async (db, categoryName, limit = 3) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT question_text FROM history WHERE category_name = ? ORDER BY created_at DESC LIMIT ?", [categoryName, limit], (err, rows) => {
            if (err) return reject(err);
            if (!rows || rows.length === 0) return resolve("ไม่มีประวัติการสอบ (No history)");
            const questions = rows.map(r => `- ${r.question_text}`);
            resolve(questions.join('\n'));
        });
    });
};

const saveHistory = async (db, categoryName, questionText) => {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO history (category_name, question_text) VALUES (?, ?)", [categoryName, questionText], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

const tryFixCorrectAnswer = (answer) => {
    if (!answer) return "Option A";
    const ans = answer.trim().toUpperCase();
    if (['A', 'OPTION A', 'OPTION_A', '(A)', '1'].includes(ans)) return "Option A";
    if (['B', 'OPTION B', 'OPTION_B', '(B)', '2'].includes(ans)) return "Option B";
    if (['C', 'OPTION C', 'OPTION_C', '(C)', '3'].includes(ans)) return "Option C";
    if (['D', 'OPTION D', 'OPTION_D', '(D)', '4'].includes(ans)) return "Option D";
    const match = ans.match(/OPTION\s*[A-D]/);
    if (match) {
        return match[0].replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
    }
    return answer;
};

const generateExamQuestion = async (categoryName, previousQuestions, customPrompt = null) => {
    // We use the OpenAI SDK with Google's compatibility endpoint for better reliability
    const openai = new OpenAI({
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
    });
    
    // If no custom prompt, use the default exam generation prompt
    const prompt = customPrompt || `จงสร้างข้อสอบปรนัย 4 ตัวเลือก จำนวน 1 ข้อ สำหรับชุดข้อสอบ (Exam Set): "${categoryName}"
ระดับความยาก: เทียบเท่าข้อสอบแข่งขันเข้ารับราชการ (เช่น ภาค ก. หรือ ท้องถิ่น)

⚠️ ข้อมูลสำคัญ 1: นี่คือข้อสอบที่คุณเคยสร้างไปแล้ว (ห้ามออกโจทย์ซ้ำเรื่องเดิม หรือคล้ายคลึงกับรายการเหล่านี้เด็ดขาด):
${previousQuestions}

⚠️ ข้อมูลสำคัญ 2 (ข้อควรระวังในการตั้งคำถามและตัวเลือก):
ห้ามตั้งคำถามที่ต้องอาศัยการดูรูปภาพ กราฟ หรือตารางประกอบ เพราะระบบไม่รองรับการแนบภาพ
หลีกเลี่ยงประเด็นอ่อนไหวทางการเมือง ศาสนา หรือบุคคลที่มีอยู่จริงในปัจจุบัน ให้ใช้สถานการณ์สมมติที่เป็นกลาง
ตัวลวง (Distractors) ในอีก 3 ตัวเลือกที่ผิด ต้องมีความน่าจะเป็นสูง สมเหตุสมผล หรือเป็นความเข้าใจผิดที่พบบ่อย
สามารถใช้ HTML Tags พื้นฐาน เช่น <b>คำที่ต้องการเน้น</b> หรือ <br> ในส่วนของโจทย์และคำอธิบายได้

⚠️ ข้อมูลสำคัญ 3 (รูปแบบคำอธิบายเฉลย - explanation):
หากเป็นวิชาคำนวณ หรือ ตรรกศาสตร์ ให้แสดงวิธีคิดวิเคราะห์ทีละขั้นตอน (Step-by-step)
หากเป็นวิชากฎหมาย ให้อ้างอิงชื่อ พ.ร.บ. และ มาตรา ที่เกี่ยวข้องอย่างชัดเจน
ทุกวิชา ต้องอธิบายสั้นๆ ด้วยว่าทำไมตัวเลือกอื่นจึงผิด

ให้คุณวิเคราะห์และแต่งข้อสอบข้อใหม่เอี่ยมที่เกี่ยวข้องกับ "${categoryName}"
และให้ตอบกลับเป็น JSON ตามแบบฟอร์มดังนี้ ปริ้นต์เฉพาะข้อมูล JSON เท่านั้น ห้ามมี Markdown backticks ข้อความนำใดๆ:
{
    "question_text": "โจทย์ข้อสอบ...",
    "option_a": "ตัวเลือก A",
    "option_b": "ตัวเลือก B",
    "option_c": "ตัวเลือก C",
    "option_d": "ตัวเลือก D",
    "correct_answer": "Option A, Option B, Option C หรือ Option D (ระบุให้เป๊ะ)",
    "subject": "หมวดหมู่วิชาหลัก (เช่น ท้องถิ่น ภาค ก, ท้องถิ่น ภาค ข)",
    "skill": "ทักษะที่ใช้วัดผล (เช่น อังกฤษ, ความรู้ทั่วไป, กฎหมาย, บัญชี)",
    "catalogs": "แท็กรายวิชา (เช่น ภาษาอังกฤษ, ความรู้พื้นฐานในการปฏิบัติราชการ)",
    "explanation": "คำอธิบายเฉลยอย่างละเอียด..."
}
`;

    const response = await openai.chat.completions.create({
        model: "gemini-1.5-flash",
        temperature: 0.7,
        messages: [
            { role: "system", content: "คุณเป็นผู้เชี่ยวชาญการออกข้อสอบข้าราชการ/พนักงานราชการ สร้างข้อสอบ 1 ข้อ และตอบกลับมาเป็น pure JSON Format เท่านั้น ห้ามตอบกลับเป็นข้อความอื่น" },
            { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
    });

    let rawJson = response.choices[0].message.content;
    const data = JSON.parse(rawJson);
    data.correct_answer = tryFixCorrectAnswer(data.correct_answer);
    return data;
};

const sendInboxAlert = async (message) => {
    try {
        const admins = await User.findAll({ where: { role: 'admin' } });
        const notifications = admins.map(admin => ({
            user_id: admin.id,
            type: "system_alert",
            message: message,
            is_read: false
        }));
        await Notification.bulkCreate(notifications);
    } catch (e) {
        logToFile(`Failed to send inbox alert: ${e.message}`, 'ERROR');
    }
};

const saveToDb = async (data, categoryName) => {
    let answerEnum = "A";
    if (data.correct_answer.includes("B")) answerEnum = "B";
    if (data.correct_answer.includes("C")) answerEnum = "C";
    if (data.correct_answer.includes("D")) answerEnum = "D";

    await Question.create({
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
        category: "local_gov", 
        exam_set: categoryName,
        exam_year: "Mockup 2569"
    });
};

let isRunning = false;
exports.getIsRunning = () => isRunning;

exports.runGenerator = async (customPrompt = null) => {
    if (isRunning) return { success: false, message: 'Already running' };
    
    isRunning = true;
    let db;
    try {
        db = await getDbConnection();
        let categoryName = "Custom Prompt";
        let previousQuestions = "ไม่มีประวัติการสอบ (No history)";

        if (!customPrompt) {
            categoryName = await getNextCategory(db);
            logToFile(`Today's Assigned Category: ${categoryName}`);
            previousQuestions = await getPreviousQuestions(db, categoryName, 1);
        } else {
            logToFile(`Processing Custom Prompt...`);
        }

        const prevCount = previousQuestions === "ไม่มีประวัติการสอบ (No history)" ? 0 : previousQuestions.split('- ').length - 1;
        if (!customPrompt) logToFile(`Fetched ${prevCount} previous questions for context.`);

        const MAX_RETRIES = 3;
        let attempt = 0;
        let examData = null;
        let lastError = null;

        while (attempt < MAX_RETRIES) {
            attempt++;
            logToFile(`Calling AI API (Attempt ${attempt}/${MAX_RETRIES})...`);
            try {
                examData = await generateExamQuestion(categoryName, previousQuestions, customPrompt);
                break;
            } catch (err) {
                lastError = err;
                logToFile(`Attempt ${attempt} failed: ${err.message}`, 'ERROR');
                if (attempt < MAX_RETRIES) {
                    await new Promise(res => setTimeout(res, (2 ** attempt) * 1000));
                }
            }
        }

        if (!examData) {
            const msg = `Failed to generate exam question after ${MAX_RETRIES} attempts. Last error: ${lastError}`;
            logToFile(msg, 'ERROR');
            await sendInboxAlert(msg);
            return;
        }

        logToFile("Successfully generated question JSON");

        logToFile("Posting to PreExam database natively...");
        try {
            await saveToDb(examData, categoryName);
            await saveHistory(db, categoryName, examData.question_text);
            const successMsg = `🤖 AI ได้สร้างข้อสอบใหม่ในชุดวิชา [${categoryName}] เรียบร้อยแล้ว (สถานะ: ฉบับร่าง) กรุณาเข้าไปตรวจสอบในคลังข้อสอบ`;
            logToFile(successMsg);
            await sendInboxAlert(successMsg);
        } catch (e) {
            const errMsg = `AI generated the exam for [${categoryName}] but failed to save to Database. Error: ${e.message}`;
            logToFile(errMsg, 'ERROR');
            await sendInboxAlert(errMsg);
        }

    } catch (e) {
        logToFile(`System Error: ${e.message}`, 'ERROR');
        await sendInboxAlert(`System Error in Generator: ${e.message}`);
    } finally {
        if (db) db.close();
        isRunning = false;
    }
};
