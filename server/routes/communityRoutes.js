const express = require('express');
const router = express.Router();
const threadController = require('../controllers/threadController');
const commentController = require('../controllers/commentController');
const { authMiddleware: protect } = require('../middleware/authMiddleware');
const { upload, processImage } = require('../middleware/uploadMiddleware');
const notificationController = require('../controllers/notificationController');
const communityReportController = require('../controllers/communityReportController');

// Thread Routes
router.post('/threads', protect, upload.single('image'), processImage, threadController.createThread);
router.post('/share-news', protect, threadController.shareNews);
router.post('/share-post', protect, threadController.shareBusinessPost);
router.get('/threads', threadController.getThreads);
router.get('/tags/trending', threadController.getTrendingTags);
router.get('/threads/user/:userId', threadController.getUserThreads);
router.get('/threads/:id', threadController.getThreadById);
router.post('/threads/:id/like', protect, threadController.likeThread);
router.post('/poll/vote', protect, threadController.votePoll);
router.delete('/threads/:id', protect, threadController.deleteThread);

// Comment Routes
router.post('/comments', protect, commentController.createComment);
router.get('/comments/:threadId', commentController.getComments);
router.post('/comments/:id/like', protect, commentController.likeComment);

// Notifications
router.get('/notifications', protect, notificationController.getNotifications);
router.put('/notifications/mark-read', protect, notificationController.markAsRead);

// Reports
router.post('/report', protect, communityReportController.reportContent);

module.exports = router;
