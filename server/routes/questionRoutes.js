const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/subjects', questionController.getSubjects);
router.get('/categories', questionController.getCategories);
router.get('/', questionController.getQuestions);
router.get('/:id', questionController.getQuestionById);
router.post('/bulk', authMiddleware, adminMiddleware, questionController.bulkCreateQuestions);
router.post('/', authMiddleware, adminMiddleware, questionController.createQuestion);
router.put('/:id', authMiddleware, adminMiddleware, questionController.updateQuestion);
router.delete('/:id', authMiddleware, adminMiddleware, questionController.deleteQuestion);

const multer = require('multer');
const upload = multer(); // Memory storage
router.post('/import', authMiddleware, adminMiddleware, upload.single('file'), questionController.importQuestions);

module.exports = router;
