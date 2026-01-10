const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// User & Admin routes (Authenticated)
router.use(authMiddleware);

router.post('/tickets', supportController.createTicket);
router.get('/tickets/my', supportController.getMyTickets);
router.get('/tickets/:id', supportController.getTicketDetails);
router.post('/tickets/:id/messages', supportController.sendMessage);
router.patch('/tickets/:id/status', supportController.updateStatus);

// Admin only routes
router.get('/admin/tickets', adminMiddleware, supportController.getAllTickets);

module.exports = router;
