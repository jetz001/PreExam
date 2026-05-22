const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraperController');

// Middleware to check API Key
const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.SCRAPER_API_KEY || 'dev_scraper_key';

    if (!apiKey || apiKey !== validApiKey) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid API Key' });
    }
    next();
};

router.post('/jobs', apiKeyMiddleware, scraperController.postJob);
router.post('/alert', apiKeyMiddleware, scraperController.postAlert);

module.exports = router;
