const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/authMiddleware'); // Assuming this exists

// Create Checkout Session
// Protect with auth middleware
// Note: webhook must be BEFORE any body parser that converts to JSON globally if we mount it there, 
// OR we handle the raw body parsing specifically for this route in index.js.
// Since router is mounted at /api/payment, let's keep it standard here.
// The raw body handling usually happens in the main app entry point before routes are passed.

router.post('/create-checkout-session', authMiddleware, paymentController.createCheckoutSession);
router.get('/plans', paymentController.getPlans);
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;
