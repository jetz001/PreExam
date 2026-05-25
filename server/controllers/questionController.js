const { db: firestore } = require('../config/firebase');

const questionsRef = firestore.collection('questions');

exports.getQuestions = async (req, res) => {
    try {
        const { category, subject, exam_year, exam_set, limit = 50, page = 1, orderBy, search } = req.query;
        const offset = (page - 1) * limit;

        // Firestore does not support 'LIKE' or multiple range filters easily.
        // We will fetch based on the strongest equality condition, and filter the rest in memory.
        let query = questionsRef;
        
        // Let's just fetch all and filter in memory if there are complex queries, 
        // or fetch by subject if subject is provided.
        if (subject && subject !== 'undefined' && subject !== 'null') {
            query = query.where('subject', '==', subject);
        }
        if (exam_year && exam_year !== 'undefined' && exam_year !== 'null') {
            query = query.where('exam_year', '==', exam_year);
        }
        if (exam_set && exam_set !== 'undefined' && exam_set !== 'null') {
            query = query.where('exam_set', '==', exam_set);
        }

        const snapshot = await query.get();
        let rows = [];

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            let match = true;

            if (search) {
                const searchStr = search.toLowerCase();
                const qText = (data.question_text || '').toLowerCase();
                if (!qText.includes(searchStr)) match = false;
            }

            if (match && category && category !== 'undefined' && category !== 'null') {
                const catStr = category.toLowerCase();
                const qCat = (data.category || '').toLowerCase();
                const qCatalogs = Array.isArray(data.catalogs) ? data.catalogs.join(',').toLowerCase() : (data.catalogs || '').toLowerCase();
                if (!qCat.includes(catStr) && !qCatalogs.includes(catStr)) match = false;
            }

            if (match) {
                rows.push({ id: doc.id, ...data });
            }
        });

        // Randomize
        if (orderBy === 'random') {
            rows.sort(() => Math.random() - 0.5);
        } else {
            rows.sort((a, b) => String(a.id).localeCompare(String(b.id))); // simple sort
        }

        const count = rows.length;
        
        // Apply pagination
        rows = rows.slice(offset, offset + parseInt(limit));

        res.json({
            success: true,
            data: {
                rows,
                total: count,
                page: parseInt(page),
                totalPages: Math.ceil(count / parseInt(limit)) || 1
            }
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getSubjects = async (req, res) => {
    try {
        const snapshot = await questionsRef.get();
        const subjects = new Set();
        snapshot.docs.forEach(doc => {
            if (doc.data().subject) subjects.add(doc.data().subject);
        });
        const subjectList = Array.from(subjects).sort();
        res.json({ success: true, data: subjectList });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getExamYears = async (req, res) => {
    try {
        const snapshot = await questionsRef.get();
        const years = new Set();
        snapshot.docs.forEach(doc => {
            if (doc.data().exam_year) years.add(doc.data().exam_year);
        });
        const yearList = Array.from(years).sort((a, b) => b.toString().localeCompare(a.toString())); // DESC
        res.json({ success: true, data: yearList });
    } catch (error) {
        console.error('Error fetching exam years:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getExamSets = async (req, res) => {
    try {
        const snapshot = await questionsRef.get();
        const sets = new Set();
        snapshot.docs.forEach(doc => {
            if (doc.data().exam_set) sets.add(doc.data().exam_set);
        });
        const setList = Array.from(sets).sort();
        res.json({ success: true, data: setList });
    } catch (error) {
        console.error('Error fetching exam sets:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const { subject } = req.query;
        let query = questionsRef;
        if (subject && subject !== 'undefined' && subject !== 'null') {
            query = query.where('subject', '==', subject);
        }

        const snapshot = await query.get();
        const allTags = new Set();

        snapshot.docs.forEach(doc => {
            const q = doc.data();
            if (q.category) {
                q.category.split(',').forEach(tag => {
                    const trimmedTag = tag.trim();
                    if (trimmedTag) allTags.add(trimmedTag);
                });
            }
            if (q.catalogs && Array.isArray(q.catalogs)) {
                q.catalogs.forEach(tag => {
                    if (tag && typeof tag === 'string') allTags.add(tag.trim());
                });
            }
        });

        res.json({ success: true, data: Array.from(allTags).sort() });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getQuestionById = async (req, res) => {
    try {
        const doc = await questionsRef.doc(req.params.id.toString()).get();
        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }
        res.json({ success: true, data: { id: doc.id, ...doc.data() } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createQuestion = async (req, res) => {
    try {
        const { catalogs, category, skill, exam_year, exam_set, ...rest } = req.body;

        let finalCatalogs = catalogs || [];
        if (category && !finalCatalogs.includes(category)) {
            finalCatalogs.push(category);
        }

        if (typeof finalCatalogs === 'string') {
            try { finalCatalogs = JSON.parse(finalCatalogs); } catch (e) { finalCatalogs = [finalCatalogs]; }
        }

        const newDocRef = questionsRef.doc();
        const newQuestion = {
            id: newDocRef.id,
            ...rest,
            category: category || (finalCatalogs.length > 0 ? finalCatalogs[0] : 'General'),
            catalogs: finalCatalogs,
            skill: skill || null,
            exam_year: exam_year || null,
            exam_set: exam_set || null,
            created_at: new Date().toISOString()
        };

        await newDocRef.set(newQuestion);
        res.status(201).json({ success: true, data: newQuestion });
    } catch (error) {
        console.error("Create Question Error", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.bulkCreateQuestions = async (req, res) => {
    try {
        const questions = req.body;
        const batch = firestore.batch();
        const createdQuestions = [];

        questions.forEach(q => {
            const newRef = questionsRef.doc();
            const newQ = { id: newRef.id, ...q, created_at: new Date().toISOString() };
            batch.set(newRef, newQ);
            createdQuestions.push(newQ);
        });

        await batch.commit();
        res.status(201).json({ success: true, count: createdQuestions.length, data: createdQuestions });
    } catch (error) {
        console.error('Error bulk creating questions:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        const docRef = questionsRef.doc(req.params.id.toString());
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }
        
        await docRef.update({ ...req.body, updated_at: new Date().toISOString() });
        const updated = await docRef.get();
        
        res.json({ success: true, data: { id: updated.id, ...updated.data() } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        const docRef = questionsRef.doc(req.params.id.toString());
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }
        await docRef.delete();
        res.json({ success: true, message: 'Question deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const xlsx = require('xlsx');

exports.importQuestions = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = xlsx.utils.sheet_to_json(sheet);

        if (rawData.length === 0) {
            return res.status(400).json({ success: false, message: 'Excel file is empty' });
        }

        const questions = [];
        for (const row of rawData) {
            // Flexible matching for headers
            const getVal = (keys) => {
                const key = Object.keys(row).find(k => keys.includes(k.toLowerCase().trim()));
                return key ? row[key] : '';
            };

            const question_text = getVal(['question text', 'question', 'q', 'คำถาม']);
            if (!question_text) continue; // Skip empty rows

            const choice_a = getVal(['option a', 'choice a', 'a', 'ตัวเลือก a', 'ตัวเลือกก', 'ก']);
            const choice_b = getVal(['option b', 'choice b', 'b', 'ตัวเลือก b', 'ตัวเลือกข', 'ข']);
            const choice_c = getVal(['option c', 'choice c', 'c', 'ตัวเลือก c', 'ตัวเลือกค', 'ค']);
            const choice_d = getVal(['option d', 'choice d', 'd', 'ตัวเลือก d', 'ตัวเลือกง', 'ง']);
            const correct_answer = getVal(['correct answer', 'answer', 'ans', 'เฉลย']).toString().toLowerCase().trim();
            const subject = getVal(['subject', 'วิชา']);
            const skill = getVal(['skill', 'ทักษะ']);
            const explanation = getVal(['explanation', 'คำอธิบาย']);
            const catalogsRaw = getVal(['catalogs', 'tags']);
            const exam_year = getVal(['exam year', 'year', 'ปี']);
            const exam_set = getVal(['exam set', 'set', 'ชุดข้อสอบ']);

            let finalCatalogs = [];
            if (catalogsRaw) {
                finalCatalogs = catalogsRaw.toString().split(',').map(s => s.trim()).filter(Boolean);
            }

            questions.push({
                question_text: question_text.toString(),
                choice_a: choice_a ? choice_a.toString() : '',
                choice_b: choice_b ? choice_b.toString() : '',
                choice_c: choice_c ? choice_c.toString() : '',
                choice_d: choice_d ? choice_d.toString() : '',
                correct_answer: correct_answer || 'a',
                subject: subject ? subject.toString() : 'General',
                skill: skill ? skill.toString() : null,
                explanation: explanation ? explanation.toString() : '',
                category: finalCatalogs.length > 0 ? finalCatalogs[0] : 'General',
                catalogs: finalCatalogs,
                exam_year: exam_year ? exam_year.toString() : null,
                exam_set: exam_set ? exam_set.toString() : null,
                difficulty: 'Normal'
            });
        }

        if (questions.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid questions found in Excel' });
        }

        const batch = firestore.batch();
        const createdQuestions = [];

        // Note: Firestore batch has a limit of 500 operations. If importing more than 500, we need chunks.
        // For simplicity, handle chunks of 450.
        const chunkedQuestions = [];
        for (let i = 0; i < questions.length; i += 450) {
            chunkedQuestions.push(questions.slice(i, i + 450));
        }

        for (const chunk of chunkedQuestions) {
            const chunkBatch = firestore.batch();
            chunk.forEach(q => {
                const newRef = questionsRef.doc();
                const newQ = { id: newRef.id, ...q, created_at: new Date().toISOString() };
                chunkBatch.set(newRef, newQ);
                createdQuestions.push(newQ);
            });
            await chunkBatch.commit();
        }

        res.status(201).json({ success: true, count: createdQuestions.length, message: `Successfully imported ${createdQuestions.length} questions` });
    } catch (error) {
        console.error('Error importing questions:', error);
        res.status(500).json({ success: false, message: 'Server error during import' });
    }
};
