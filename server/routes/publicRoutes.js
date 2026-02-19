
const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');


router.get('/stats', publicController.getLandingStats);
router.get('/settings', publicController.getSystemSettings);
router.post('/log', publicController.logFrontendActivity);

module.exports = router;
