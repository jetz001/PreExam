const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/submit', authMiddleware, examController.submitExam);
router.post('/start', authMiddleware, examController.logExamStart);
router.get('/history', authMiddleware, examController.getExamResults);
router.get('/:id', authMiddleware, examController.getExamResultById);

module.exports = router;
