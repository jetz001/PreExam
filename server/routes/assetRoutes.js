const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer Storage for Memory (to upload to R2 directly)
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

router.get('/', assetController.getAssets);
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), assetController.createAsset);
router.delete('/:id', authMiddleware, adminMiddleware, assetController.deleteAsset);

module.exports = router;
