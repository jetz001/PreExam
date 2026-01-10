const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

router.get('/:friendId', authMiddleware, chatController.getMessages);
router.post('/send', authMiddleware, chatController.sendMessage);
router.post('/read', authMiddleware, chatController.markRead);

module.exports = router;
