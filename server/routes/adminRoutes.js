const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Protect all routes with auth and admin check
router.use(authMiddleware, adminMiddleware);

// Dashboard Stats
router.get('/stats', adminController.getDashboardStats);

// User Management
router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/permissions', adminController.updateUserPermissions);

// Payment Management
router.get('/payments', adminController.getPayments);
router.post('/payments/:id/approve', adminController.approvePayment);
router.post('/payments/:id/reject', adminController.rejectPayment);

// Inbox
router.get('/messages', adminController.getMessages);

// Community & Reports
router.get('/threads', adminController.getThreads);
router.delete('/threads/:id', adminController.deleteThread);
router.get('/reports', adminController.getReports);
router.post('/reports/:id/resolve', adminController.resolveReport);

// Ad Management
router.get('/ads/pending', adminController.getPendingAds);
router.post('/ads/:id/approve', adminController.approveAd);
router.post('/ads/:id/reject', adminController.rejectAd);

// Business Management
router.get('/businesses', adminController.getBusinesses);
router.put('/businesses/:id/verify', adminController.verifyBusiness);
router.delete('/businesses/:id', adminController.deleteBusiness);

// System Settings
router.get('/settings', adminController.getSystemSettings);
router.put('/settings', adminController.updateSystemSettings);

module.exports = router;
