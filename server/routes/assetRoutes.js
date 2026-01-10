const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'asset-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get('/', assetController.getAssets);
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), assetController.createAsset);
router.delete('/:id', authMiddleware, adminMiddleware, assetController.deleteAsset);

module.exports = router;
