const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Use Disk Storage instead of Memory Storage for large files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../public/uploads');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit for videos
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp|mp4|webm|quicktime/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images and videos are allowed'));
    }
});

const processMedia = async (req, res, next) => {
    if (!req.file) return next();

    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const dir = path.join(__dirname, '../public/uploads');

    // Ensure final upload dir exists
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const originalPath = req.file.path; // Path to temp file from diskStorage

    // Process Video
    if (req.file.mimetype.startsWith('video/')) {
        const filename = `video-${timestamp}-${random}.mp4`;
        const uploadPath = path.join(dir, filename);

        console.log("Compressing video from:", originalPath);

        // Compress using ffmpeg
        ffmpeg(originalPath)
            .outputOptions([
                '-c:v libx264',
                '-crf 28',        // Compressed quality
                '-preset fast',
                '-vf scale=-2:720', // Scale to 720p
                '-movflags +faststart'
            ])
            .save(uploadPath)
            .on('end', () => {
                console.log('Video compression finished');
                // Delete original temp file
                fs.unlink(originalPath, (err) => {
                    if (err) console.error("Error deleting temp file:", err);
                });

                req.file.filename = filename;
                req.file.path = uploadPath;
                // Update destination to point to final folder
                req.file.destination = dir;
                next();
            })
            .on('error', (err) => {
                console.error('Error compressing video:', err);
                // Clean up temp file on error
                fs.unlink(originalPath, () => { });
                return res.status(500).json({ error: 'Error processing video' });
            });

    } else {
        // Process Image
        const filename = `thread-${timestamp}-${random}.webp`;
        const uploadPath = path.join(dir, filename);

        try {
            await sharp(originalPath) // sharp can read from file path
                .resize(1024, null, { withoutEnlargement: true })
                .toFormat('webp', { quality: 80 })
                .toFile(uploadPath);

            // Clean up original temp image
            fs.unlink(originalPath, (err) => {
                if (err) console.error("Error deleting temp image:", err);
            });

            req.file.filename = filename;
            req.file.path = uploadPath;
            req.file.destination = dir;
            next();
        } catch (error) {
            console.error('Error processing image:', error);
            fs.unlink(originalPath, () => { });
            return res.status(500).json({ error: 'Error processing image' });
        }
    }
};

module.exports = { upload, processImage: processMedia };
