const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adsController = require('../controllers/adsController'); // New Import
const backupController = require('../controllers/backupController');
const { authMiddleware } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temp upload for restoration

// Protect all routes with auth and admin check
router.use(authMiddleware, adminMiddleware);

// Backup & Restore
router.get('/backups', backupController.getBackups);
router.get('/backups/logs', backupController.getBackupLogs);
router.post('/backups', backupController.createBackup);
router.post('/restore', upload.single('backup_file'), backupController.restoreBackup);

// Dashboard Stats
router.get('/stats', adminController.getDashboardStats);

// User Management
router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/permissions', adminController.updateUserPermissions);
router.get('/users/:id/history', adminController.getUserHistory);
router.get('/users/:id/logs', adminController.getUserLogs);

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
