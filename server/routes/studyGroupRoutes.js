const express = require('express');
const router = express.Router();
const studyGroupController = require('../controllers/studyGroupController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, studyGroupController.getAllGroups);
router.get('/my-groups', authMiddleware, studyGroupController.getMyGroups);
router.post('/', authMiddleware, studyGroupController.createGroup);
router.post('/:id/join', authMiddleware, studyGroupController.joinGroup);
router.get('/:id/messages', authMiddleware, studyGroupController.getMessages);
router.post('/:id/messages', authMiddleware, studyGroupController.sendMessage);
router.delete('/:id', authMiddleware, studyGroupController.deleteGroup);

module.exports = router;
