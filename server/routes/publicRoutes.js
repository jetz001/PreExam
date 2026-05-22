
const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const { optionalAuthMiddleware } = require('../middleware/authMiddleware');


router.get('/stats', publicController.getLandingStats);
router.get('/settings', publicController.getSystemSettings);
router.post('/log', optionalAuthMiddleware, publicController.logFrontendActivity);

module.exports = router;
