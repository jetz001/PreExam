const { BusinessPost, Business, User, BusinessPostLike, UserBookmark } = require('../models');

exports.createPost = async (req, res) => {
    try {
        const { business_id, type, title, content, tags, series_name, is_pinned } = req.body;

        // Validate business_id
        if (!business_id) {
            return res.status(400).json({ success: false, message: 'Business ID is required' });
        }

        // Verify ownership
        const business = await Business.findByPk(business_id);

        if (!business) {
            return res.status(404).json({ success: false, message: `Business with ID ${business_id} not found` });
        }

        // Strict check: Ensure strings/numbers are compared correctly
        if (String(business.owner_uid) !== String(req.user.id)) {
            console.warn(`[CreatePost] 403 Forbidden: User ${req.user.id} attempted to post to Business ${business_id} (Owned by ${business.owner_uid})`);
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: You do not own this business page',
                debug: { userId: req.user.id, businessId: business_id, ownerId: business.owner_uid }
            });
        }

        // Handle Pinned Logic: Unpin others if this one is pinned
        if (is_pinned === true || is_pinned === 'true') {
            await BusinessPost.update({ is_pinned: false }, { where: { business_id } });
        }

        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => `/uploads/${file.filename}`);
        }

        const post = await BusinessPost.create({
            business_id,
            type,
            title,
            content,
            tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
            series_name,
            is_pinned: is_pinned === 'true' || is_pinned === true,
            images
        });

        // --- Notification Logic ---
        try {
            const { Notification } = require('../models');
            const followers = await business.getFollowers({ attributes: ['id'] });

            if (followers.length > 0) {
                const notifications = followers.map(follower => ({
                    user_id: follower.id,
                    type: 'new_post',
                    source_id: post.id,
                    message: `${business.name} posted a new update: ${title}`,
                    created_at: new Date(), // Standardize
                    updated_at: new Date()
                }));

                await Notification.bulkCreate(notifications);
            }
        } catch (notifError) {
            console.error('Notification Error:', notifError);
        }
        // -------------------------

        res.status(201).json({ success: true, post });
    } catch (error) {
        console.error('Create Post Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create post', error: error.message });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const { business_id, limit = 20, page = 1 } = req.query;
        const offset = (page - 1) * limit;
        const where = {};

        if (business_id) where.business_id = business_id;

        const posts = await BusinessPost.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [
                ['is_pinned', 'DESC'], // Pinned first
                ['created_at', 'DESC']
            ],
            include: [
                { model: Business, as: 'Business', attributes: ['name', 'logo_image', 'id'] }
            ]
        });

        res.json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch posts', error: error.message });
    }
};

exports.getPostDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await BusinessPost.findByPk(id, {
            include: [
                { model: Business, as: 'Business' }
            ]
        });

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        res.json({ success: true, post });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch post', error: error.message });
    }
};

exports.toggleLike = async (req, res) => {
    try {
        const user_uid = req.user.id;
        const { post_id } = req.body;

        const existingLike = await BusinessPostLike.findOne({ where: { user_uid, post_id } });
        const post = await BusinessPost.findByPk(post_id);

        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        if (existingLike) {
            await existingLike.destroy();
            await post.decrement('likes_count');
            res.json({ success: true, liked: false, likes_count: post.likes_count - 1 });
        } else {
            await BusinessPostLike.create({ user_uid, post_id });
            await post.increment('likes_count');
            res.json({ success: true, liked: true, likes_count: post.likes_count + 1 });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error toggling like', error: error.message });
    }
}


exports.toggleBookmark = async (req, res) => {
    try {
        const user_uid = req.user.id;
        const { post_id } = req.body;

        const existingBookmark = await UserBookmark.findOne({ where: { user_uid, post_id } });

        if (existingBookmark) {
            await existingBookmark.destroy();
            res.json({ success: true, bookmarked: false });
        } else {
            await UserBookmark.create({ user_uid, post_id });
            res.json({ success: true, bookmarked: true });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error toggling bookmark', error: error.message });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, tags, series_name, is_pinned } = req.body;

        // Ensure strictly authenticated user
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const userId = req.user.id;

        const post = await BusinessPost.findByPk(id, {
            include: [{ model: Business, as: 'Business' }]
        });

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Verify Ownership
        if (String(post.Business.owner_uid) !== String(userId)) {
            return res.status(403).json({ success: false, message: 'Unauthorized: You do not own this business page' });
        }

        // Handle Pinned Logic
        if (is_pinned === true || is_pinned === 'true') { // If setting to true
            // Unpin others for this business
            await BusinessPost.update({ is_pinned: false }, { where: { business_id: post.business_id } });
        }

        // Update Fields
        if (title) post.title = title;
        if (content) post.content = content;
        if (tags) post.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        if (series_name !== undefined) post.series_name = series_name;
        if (is_pinned !== undefined) post.is_pinned = is_pinned === 'true' || is_pinned === true;

        // Handle Images (Replace strategy)
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => `/uploads/${file.filename}`);
            post.images = newImages;
        }

        await post.save();

        res.json({ success: true, post });
    } catch (error) {
        console.error('Update Post Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update post', error: error.message });
    }
};
