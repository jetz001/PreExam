const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/request', authMiddleware, friendController.sendRequest);
router.post('/accept', authMiddleware, friendController.acceptRequest); // Used POST for action
router.delete('/remove/:friendId', authMiddleware, friendController.removeFriend);
router.get('/list', authMiddleware, friendController.getFriends);
router.get('/pending', authMiddleware, friendController.getPendingRequests);
router.get('/search', authMiddleware, friendController.searchUsers);
router.get('/check/:userId', authMiddleware, friendController.checkStatus);

module.exports = router;
