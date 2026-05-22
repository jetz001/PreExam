const express = require('express');
const router = express.Router();
const legalController = require('../controllers/legalController');
const { authMiddleware: verifyToken, adminMiddleware: isAdmin } = require('../middleware/authMiddleware');

// Public route to get policy
router.get('/policy', legalController.getPrivacyPolicy);

// Admin route to update policy
router.put('/policy', verifyToken, isAdmin, legalController.updatePrivacyPolicy);

module.exports = router;
