const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/', newsController.getNews);
router.get('/landing', newsController.getLandingPageNews); // Public route for landing page

// Scrape Metadata
router.get('/popular-keywords', newsController.getPopularKeywords);
router.post('/scrape', authMiddleware, adminMiddleware, newsController.scrapeMetadata);

router.get('/:id', newsController.getNewsById);
router.post('/', authMiddleware, adminMiddleware, newsController.createNews);
router.put('/:id', authMiddleware, adminMiddleware, newsController.updateNews);
router.put('/:id/feature', authMiddleware, adminMiddleware, newsController.toggleFeature); // Admin toggle feature
router.delete('/:id', authMiddleware, adminMiddleware, newsController.deleteNews);

// Sources
router.get('/sources/all', authMiddleware, adminMiddleware, newsController.getSources);
router.post('/sources', authMiddleware, adminMiddleware, newsController.createSource);
router.delete('/sources/:id', authMiddleware, adminMiddleware, newsController.deleteSource);

module.exports = router;
