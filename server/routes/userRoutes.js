const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');

const { upload, processImage } = require('../middleware/uploadMiddleware');

router.put('/settings', authMiddleware, userController.updateSettings);
router.get('/stats/heatmap', authMiddleware, userController.getHeatmapStats);
router.get('/stats/radar', authMiddleware, userController.getRadarStats);
router.get('/stats', authMiddleware, userController.getStats);
router.get('/search', authMiddleware, userController.searchUsers);
router.get('/profile/:id', authMiddleware, userController.getUserProfile);
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, upload.single('avatar'), processImage, userController.updateProfile);
router.get('/', authMiddleware, userController.getAllUsers);
router.delete('/profile', authMiddleware, userController.deleteAccount);
router.delete('/business-profile', authMiddleware, userController.downgradeToUser);

module.exports = router;
