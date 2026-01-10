const express = require('express');
const router = express.Router();
const adsController = require('../controllers/adsController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public / System
router.get('/stats/daily-burn', authMiddleware, adsController.getDailyBurn);
router.get('/serve', adsController.serveAd);
router.post('/record-view', adsController.recordView);
router.post('/record-click', adsController.recordClick);

const mult = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer
const uploadDir = path.join(__dirname, '../public/uploads'); // Assuming express static serves from public/uploads or similar. 
// Note: server/index.js line 39: app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
// My view of file structure showed 'uploads' folder in root server/uploads. 
// But index.js says public/uploads.
// Let's check listing again. Step 184: "uploads" directory AND "public".
// Step 221 assetRoutes uses `../uploads`.
// I should stick to `../uploads` (server root uploads) IF index.js serves it.
// Wait, index.js line 39: `app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));`
// This means it expects files in `server/public/uploads`.
// But assetRoutes calls `path.join(__dirname, '../uploads')` which is `server/uploads`. This might be a bug in assetRoutes or my understanding.
// Let's check if `server/public/uploads` exists.

const uDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uDir)) {
    fs.mkdirSync(uDir, { recursive: true });
}

const storage = mult.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'ad-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = mult({ storage: storage });

// Sponsor (Business)
router.post('/upload', authMiddleware, upload.single('image'), adsController.uploadCreative);
router.post('/create', authMiddleware, adsController.createAd);
router.put('/:id', authMiddleware, adsController.updateAd);
router.get('/my-ads', authMiddleware, adsController.getMyAds);
router.patch('/:id/status', authMiddleware, adsController.toggleAdStatus);
router.get('/wallet', authMiddleware, adsController.getWallet);
router.get('/wallet/transactions', authMiddleware, adsController.getTransactions);
router.post('/wallet/topup', authMiddleware, adsController.topUpWallet);
router.get('/dashboard', authMiddleware, adsController.getDashboardStats);

// Admin
router.get('/admin/sponsors', authMiddleware, adminMiddleware, adsController.getAllSponsors);
router.patch('/admin/sponsors/:id/suspend', authMiddleware, adminMiddleware, adsController.suspendSponsor);
router.post('/admin/sponsors/:id/adjust-wallet', authMiddleware, adminMiddleware, adsController.adjustSponsorWallet);
router.get('/admin/stats', authMiddleware, adminMiddleware, adsController.getPlatformStats);
router.get('/admin/config', authMiddleware, adminMiddleware, adsController.getConfigs);
router.post('/admin/config', authMiddleware, adminMiddleware, adsController.updateConfigs);

module.exports = router;
