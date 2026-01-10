const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, bookmarkController.getBookmarks);
router.post('/', authMiddleware, bookmarkController.addBookmark);
router.delete('/:id', authMiddleware, bookmarkController.removeBookmark);

module.exports = router;
