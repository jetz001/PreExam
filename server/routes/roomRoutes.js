const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, roomController.getRooms);
router.post('/', authMiddleware, roomController.createRoom);
router.post('/join', authMiddleware, roomController.joinRoom);
router.get('/:id', authMiddleware, roomController.getRoom);

router.delete('/:id', authMiddleware, roomController.deleteRoom);

module.exports = router;
