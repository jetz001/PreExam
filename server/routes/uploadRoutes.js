const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFileToR2 } = require('../services/r2Service');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', authMiddleware, adminMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const url = await uploadFileToR2(req.file.buffer, req.file.originalname, req.file.mimetype);
        res.json({ success: true, url });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
});

module.exports = router;
