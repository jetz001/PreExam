const { Question, Sequelize } = require('../models');
const Op = Sequelize.Op;

exports.getQuestions = async (req, res) => {
    try {
        const { category, subject, exam_year, exam_set, limit = 50, page = 1, orderBy, search } = req.query;
        const offset = (page - 1) * limit;
        const where = {};

        if (search) {
            where.question_text = { [Op.like]: `%${search}%` };
        }

        if (category && category !== 'undefined' && category !== 'null') {
            where[Op.or] = [
                { category: { [Op.like]: `%${category}%` } },
                { catalogs: { [Op.like]: `%${category}%` } }
            ];
        }
        if (subject && subject !== 'undefined' && subject !== 'null') {
            where.subject = { [Op.like]: `%${subject}%` };
        }
        if (exam_year && exam_year !== 'undefined' && exam_year !== 'null') {
            where.exam_year = { [Op.like]: `%${exam_year}%` };
        }
        if (exam_set && exam_set !== 'undefined' && exam_set !== 'null') {
            where.exam_set = { [Op.like]: `%${exam_set}%` };
        }

        let order = [['id', 'ASC']]; // Default stable sort
        if (orderBy === 'random') {
            order = [Sequelize.literal('RANDOM()')];
        } else if (orderBy === 'id') {
            order = [['id', 'ASC']];
        }

        const { count, rows } = await Question.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order,
        });

        res.json({
            success: true,
            data: {
                rows,
                total: count,
                page: parseInt(page),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getSubjects = async (req, res) => {
    try {
        const subjects = await Question.findAll({
            attributes: ['subject'],
            group: ['subject'],
            order: [['subject', 'ASC']]
        });
        // Extract just the subject strings
        const subjectList = subjects.map(s => s.subject).filter(s => s);
        res.json({ success: true, data: subjectList });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getExamYears = async (req, res) => {
    try {
        const years = await Question.findAll({
            attributes: ['exam_year'],
            group: ['exam_year'],
            order: [['exam_year', 'DESC']]
        });
        const yearList = years.map(y => y.exam_year).filter(y => y);
        res.json({ success: true, data: yearList });
    } catch (error) {
        console.error('Error fetching exam years:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getExamSets = async (req, res) => {
    try {
        const sets = await Question.findAll({
            attributes: ['exam_set'],
            group: ['exam_set'],
            order: [['exam_set', 'ASC']]
        });
        const setList = sets.map(s => s.exam_set).filter(s => s);
        res.json({ success: true, data: setList });
    } catch (error) {
        console.error('Error fetching exam sets:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const { subject } = req.query;
        const where = {};
        if (subject && subject !== 'undefined' && subject !== 'null') {
            where.subject = { [Op.like]: `%${subject}%` };
        }

        const questions = await Question.findAll({
            where,
            attributes: ['category', 'catalogs'],
        });

        // Extract all tags, split by comma, trim, and get unique values
        const allTags = new Set();
        questions.forEach(q => {
            // Legacy Category
            if (q.category) {
                q.category.split(',').forEach(tag => {
                    const trimmedTag = tag.trim();
                    if (trimmedTag) allTags.add(trimmedTag);
                });
            }
            // New Catalogs Array
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
        const question = await Question.findByPk(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }
        res.json({ success: true, data: question });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createQuestion = async (req, res) => {
    try {
        const { catalogs, category, skill, exam_year, exam_set, ...rest } = req.body;

        let finalCatalogs = catalogs || [];
        // If legacy category provided and not in catalogs, add it
        if (category && !finalCatalogs.includes(category)) {
            finalCatalogs.push(category);
        }

        // Ensure catalogs is array
        if (typeof finalCatalogs === 'string') {
            try { finalCatalogs = JSON.parse(finalCatalogs); } catch (e) { finalCatalogs = [finalCatalogs]; }
        }

        const question = await Question.create({
            ...rest,
            category: category || (finalCatalogs.length > 0 ? finalCatalogs[0] : 'General'), // Fallback for legacy field checks
            catalogs: finalCatalogs,
            skill: skill || null, // New Skill Field for Radar Chart
            exam_year: exam_year || null,
            exam_set: exam_set || null
        });
        res.status(201).json({ success: true, data: question });
    } catch (error) {
        console.error("Create Question Error", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.bulkCreateQuestions = async (req, res) => {
    try {
        const questions = await Question.bulkCreate(req.body);
        res.status(201).json({ success: true, count: questions.length, data: questions });
    } catch (error) {
        console.error('Error bulk creating questions:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        const question = await Question.findByPk(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        const { catalogs, category, skill, exam_year, exam_set, ...rest } = req.body;
        const updateData = { ...rest };

        if (exam_year !== undefined) updateData.exam_year = exam_year;
        if (exam_set !== undefined) updateData.exam_set = exam_set;

        if (catalogs !== undefined) {
            let finalCatalogs = catalogs;
            if (typeof finalCatalogs === 'string') {
                try { finalCatalogs = JSON.parse(finalCatalogs); } catch (e) { finalCatalogs = [finalCatalogs]; }
            }
            updateData.catalogs = finalCatalogs;
            // Sync legacy category if needed, or leave it. 
            // Let's update category to first catalog item if available for backward compatibility
            if (finalCatalogs.length > 0) updateData.category = finalCatalogs[0];
        }

        if (category) {
            updateData.category = category;
        }

        if (skill !== undefined) {
            updateData.skill = skill;
        }

        await question.update(updateData);
        res.json({ success: true, data: question });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.importQuestions = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const xlsx = require('xlsx');
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const questionsToCreate = [];

        for (const row of data) {
            // Flexible matching for headings (case insensitive, removing spaces)
            const getVal = (keys) => {
                for (const k of Object.keys(row)) {
                    const normalized = k.toLowerCase().replace(/[^a-z0-9]/g, '');
                    if (keys.some(key => normalized === key)) return row[k];
                }
                return null;
            };

            const questionText = getVal(['question', 'questiontext', 'q']);
            if (!questionText) continue; // Skip empty rows

            const catalogsRaw = getVal(['catalogs', 'tags', 'category']);
            let catalogs = [];
            if (catalogsRaw) {
                if (typeof catalogsRaw === 'string') {
                    catalogs = catalogsRaw.split(',').map(s => s.trim()).filter(Boolean);
                } else {
                    catalogs = [String(catalogsRaw)];
                }
            }

            // Default Subject if missing
            const subject = getVal(['subject']) || 'General';
            const skill = getVal(['skill', 'radar', 'radarcategory']) || null;
            const exam_year = getVal(['year', 'examyear']) || null;
            const exam_set = getVal(['set', 'examset', 'type']) || null; // e.g. "Mock Exam" or "Past Exam"

            // Map correct answer to single letter lowercase 'a', 'b', 'c', 'd'
            let correct = getVal(['correct', 'correctanswer', 'answer']);
            if (correct) {
                correct = String(correct).toLowerCase().trim().charAt(0);
                if (!['a', 'b', 'c', 'd'].includes(correct)) correct = 'a'; // Fallback
            } else {
                correct = 'a';
            }

            questionsToCreate.push({
                question_text: questionText,
                choice_a: getVal(['optiona', 'a', 'choicea']) || 'Option A',
                choice_b: getVal(['optionb', 'b', 'choiceb']) || 'Option B',
                choice_c: getVal(['optionc', 'c', 'choicec']) || 'Option C',
                choice_d: getVal(['optiond', 'd', 'choiced']) || 'Option D',
                correct_answer: correct,
                explanation: getVal(['explanation', 'explain']) || '',
                subject: subject,
                catalogs: catalogs,
                category: catalogs.length > 0 ? catalogs[0] : 'General', // Legacy fallback
                skill: skill,
                exam_year: exam_year,
                exam_set: exam_set,
                difficulty: 50 // Default
            });
        }

        if (questionsToCreate.length > 0) {
            await Question.bulkCreate(questionsToCreate);
        }

        res.json({
            success: true,
            message: `Successfully imported ${questionsToCreate.length} questions`,
            count: questionsToCreate.length
        });

    } catch (error) {
        console.error('Import Error:', error);
        res.status(500).json({ success: false, message: 'Server error during import' });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findByPk(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }
        await question.destroy();
        res.json({ success: true, message: 'Question deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
