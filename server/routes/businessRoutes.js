const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const postController = require('../controllers/postController');
const { authMiddleware: verifyToken, optionalAuthMiddleware } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware'); // Assuming this handles file uploads

// Business Routes
router.post('/', verifyToken, businessController.createBusiness);
router.get('/my-business', verifyToken, businessController.getMyBusiness);
router.get('/', businessController.getAllBusinesses);
router.put('/', verifyToken, upload.fields([{ name: 'cover_image', maxCount: 1 }, { name: 'logo_image', maxCount: 1 }]), businessController.updateBusiness);

router.post('/follow', verifyToken, businessController.followBusiness);
router.post('/unfollow', verifyToken, businessController.unfollowBusiness);
router.get('/feed', verifyToken, businessController.getFollowingFeed);
router.post('/message', verifyToken, businessController.sendMessage);
router.get('/inbox', verifyToken, businessController.getInbox);
router.get('/:business_id/messages', verifyToken, businessController.getMessages);
// System Broadcast
router.get('/settings', verifyToken, businessController.getSystemSettings);

// Post Routes (Nested strictly speaking, but flat for API simplicity often easier)
router.post('/posts', verifyToken, upload.array('images', 5), postController.createPost);
router.put('/posts/:id', verifyToken, upload.array('images', 5), postController.updatePost);
router.get('/posts', postController.getPosts); // Can filter by business_id in query
router.get('/posts/:id', postController.getPostDetail);
router.post('/posts/like', verifyToken, postController.toggleLike);
router.post('/posts/bookmark', verifyToken, postController.toggleBookmark);

// Specific Business Route (Must be last to avoid shadowing)
router.get('/:id', optionalAuthMiddleware, businessController.getBusinessById);

// Review Routes
router.post('/reviews', verifyToken, businessController.createReview);
router.get('/:business_id/reviews', businessController.getReviews);

router.post('/verify', verifyToken, upload.fields([
    { name: 'vat20', maxCount: 1 },
    { name: 'certificate', maxCount: 1 },
    { name: 'id_card', maxCount: 1 },
    { name: 'others', maxCount: 5 }
]), businessController.submitVerification);

module.exports = router;
