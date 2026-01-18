const { Business, User, UserFollow, BusinessPost, BusinessReview, BusinessMessage, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.createBusiness = async (req, res) => {
    try {
        const { name, tagline, category, contact_link, contact_line_id, contact_facebook_url } = req.body;
        const owner_uid = req.user.id; // Assuming auth middleware populates req.user

        // Check if user already has a business
        const existingBusiness = await Business.findOne({ where: { owner_uid } });
        if (existingBusiness) {
            return res.status(400).json({ success: false, message: 'User already has a business page.' });
        }

        const business = await Business.create({
            owner_uid,
            name,
            tagline,
            category,
            contact_link,
            contact_line_id,
            contact_facebook_url,
            status: 'approved' // Default status changed to approved for immediate visibility
        });

        // Optionally update User role or flag if necessary
        // await User.update({ is_business: true }, { where: { id: owner_uid } });

        res.status(201).json({ success: true, business });
    } catch (error) {
        console.error('Create Business Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create business.', error: error.message });
    }
};

exports.getMyBusiness = async (req, res) => {
    try {
        const owner_uid = req.user.id;
        let business = await Business.findOne({
            where: { owner_uid },
            include: [
                { model: User, as: 'Owner', attributes: ['id', 'display_name', 'avatar'] }
            ]
        });

        if (!business) {
            return res.status(404).json({ success: false, message: 'Business not found.' });
        }

        res.json({ success: true, business });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching business.', error: error.message });
    }
};

exports.getBusinessById = async (req, res) => {
    try {
        const { id } = req.params;
        const business = await Business.findByPk(id, {
            include: [
                { model: User, as: 'Owner', attributes: ['id', 'display_name', 'avatar'] }
            ]
        });

        if (!business) {
            return res.status(404).json({ success: false, message: 'Business not found.' });
        }

        // Increment view count (simple implementation)
        // Increment view count (simple implementation)
        // In production, use a separate stats service or debouncing to avoid write-heavy ops
        // Removed direct increment on JSON field to strictly use the manual update below to avoid dialect issues
        // await business.increment('stats.views', { by: 1 }); // stats is JSON, simplistic increment might not work on all DBs with JSON path.
        // Sequelize increment on JSON path is tricky. For SQLite/MySQL JSON, maybe just update:
        const currentStats = business.stats || { views: 0, clicks: 0, followers: 0 };
        currentStats.views = (currentStats.views || 0) + 1;
        business.stats = currentStats;
        // Force update because JSON changes might not be detected if deep
        business.changed('stats', true);
        await business.save({ fields: ['stats'] });

        const businessJson = business.toJSON();
        console.log('getBusinessById: req.user is', req.user?.id);
        if (req.user) {
            const follow = await UserFollow.findOne({ where: { user_uid: req.user.id, business_id: id } });
            console.log('getBusinessById: follow record found?', !!follow);
            businessJson.isFollowing = !!follow;
        } else {
            businessJson.isFollowing = false;
        }

        res.json({ success: true, business: businessJson });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching business.', error: error.message });
    }
};

exports.updateBusiness = async (req, res) => {
    try {
        const owner_uid = req.user.id;
        const { name, tagline, about, category, contact_line_id, contact_facebook_url } = req.body;

        const business = await Business.findOne({ where: { owner_uid } });
        if (!business) {
            return res.status(404).json({ success: false, message: 'Business not found.' });
        }

        // Update fields
        if (name) business.name = name;
        if (tagline) business.tagline = tagline;
        if (about) business.about = about;
        if (category) business.category = category;
        if (contact_line_id) business.contact_line_id = contact_line_id;
        if (contact_facebook_url) business.contact_facebook_url = contact_facebook_url;

        // Handle image uploads if processed by middleware
        if (req.files && req.files.cover_image) {
            business.cover_image = `/uploads/${req.files.cover_image[0].filename}`;
        }
        if (req.files && req.files.logo_image) {
            business.logo_image = `/uploads/${req.files.logo_image[0].filename}`;
        }

        await business.save();
        res.json({ success: true, business });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating business.', error: error.message });
    }
};

exports.getAllBusinesses = async (req, res) => {
    try {
        const { search, category, sort } = req.query;
        // Show all businesses for now (removed status: 'approved' filter)
        const where = {};

        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { tagline: { [Op.like]: `%${search}%` } }
            ];
        }
        if (category) {
            where.category = category;
        }

        const businesses = await Business.findAll({
            where,
            limit: 50,
            order: [['createdAt', 'DESC']] // Default sort
        });

        res.json({ success: true, businesses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching businesses.', error: error.message });
    }
};

exports.followBusiness = async (req, res) => {
    try {
        const user_uid = req.user.id;
        const { business_id } = req.body;

        const business = await Business.findByPk(business_id);
        if (!business) return res.status(404).json({ success: false, message: 'Business not found' });

        await UserFollow.create({ user_uid, business_id });

        // Update stats
        const currentStats = business.stats || { views: 0, clicks: 0, followers: 0 };
        currentStats.followers = (currentStats.followers || 0) + 1;
        business.stats = currentStats;
        business.changed('stats', true);
        await business.save();

        res.json({ success: true, message: 'Followed successfully' });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ success: false, message: 'Already following' });
        }
        res.status(500).json({ success: false, message: 'Error following business', error: error.message });
    }
};

exports.unfollowBusiness = async (req, res) => {
    try {
        const user_uid = req.user.id;
        const { business_id } = req.body;

        const deleted = await UserFollow.destroy({
            where: { user_uid, business_id }
        });

        if (deleted) {
            const business = await Business.findByPk(business_id);
            if (business) {
                const currentStats = business.stats || { views: 0, clicks: 0, followers: 0 };
                currentStats.followers = Math.max(0, (currentStats.followers || 0) - 1);
                business.stats = currentStats;
                business.changed('stats', true);
                await business.save();
            }
        }

        res.json({ success: true, message: 'Unfollowed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error unfollowing business', error: error.message });
    }
};

exports.createReview = async (req, res) => {
    try {
        const user_uid = req.user.id;
        const { business_id, rating, comment } = req.body;

        // Verify purchase/interaction could be added here later

        const review = await BusinessReview.create({
            business_id,
            user_uid,
            rating,
            comment
        });

        // Update Business Average Rating
        const reviews = await BusinessReview.findAll({ where: { business_id } });
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = (totalRating / reviews.length).toFixed(1);

        await Business.update(
            { rating_avg: avgRating, rating_count: reviews.length },
            { where: { id: business_id } }
        );

        res.json({ success: true, review });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating review', error: error.message });
    }
};

exports.getReviews = async (req, res) => {
    try {
        const { business_id } = req.params;
        const reviews = await BusinessReview.findAll({
            where: { business_id },
            include: [{ model: User, as: 'Reviewer', attributes: ['id', 'display_name', 'avatar'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching reviews', error: error.message });
    }
};

exports.getFollowingFeed = async (req, res) => {
    try {
        const userId = req.user.id;
        const followedBusinesses = await UserFollow.findAll({
            where: { user_uid: userId },
            attributes: ['business_id']
        });

        const businessIds = followedBusinesses.map(fb => fb.business_id);

        const posts = await BusinessPost.findAll({
            where: { business_id: businessIds },
            include: [
                {
                    model: Business,
                    as: 'Business',
                    attributes: ['id', 'name', 'logo_image']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 20
        });

        res.json({ success: true, posts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching feed" });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { business_id, message } = req.body;
        const userId = req.user.id;

        // Check if business exists
        const business = await Business.findByPk(business_id);
        if (!business) return res.status(404).json({ message: "Business not found" });

        // Determine sender type
        let sender_type = 'user';
        let targetUserId = userId; // Default: user sending to business

        // If to_user_id is provided, it's an explicit reply from the business (Inbox logic)
        if (req.body.to_user_id) {
            // Verify ownership to send AS business
            if (business.owner_uid !== userId) {
                return res.status(403).json({ message: "Only business owner can reply to specific users" });
            }
            sender_type = 'business';
            targetUserId = req.body.to_user_id;
        } else {
            // No recipient specified: Acting as a USER sending TO the business.
            // Even if owner, we treat them as a user initiating/continuing a chat with their own page.
            sender_type = 'user';
            targetUserId = userId;
        }

        const newMessage = await BusinessMessage.create({
            business_id,
            user_id: targetUserId, // The conversation is always identified by (business_id, user_id)
            sender_type,
            message,
            is_read: false
        });

        res.status(201).json({ success: true, message: newMessage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error sending message" });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { business_id } = req.params;
        const userId = req.user.id;

        // Check if business exists
        const business = await Business.findByPk(business_id);
        if (!business) return res.status(404).json({ message: "Business not found" });

        // If user is owner, they need to specify which user conversation to fetch
        let targetUserId = userId;
        if (business.owner_uid === userId) {
            if (!req.query.user_id) {
                return res.status(400).json({ message: "User ID required to fetch conversation" });
            }
            targetUserId = req.query.user_id;
        }

        const messages = await BusinessMessage.findAll({
            where: {
                business_id,
                user_id: targetUserId
            },
            order: [['created_at', 'ASC']],
            include: [
                { model: User, as: 'User', attributes: ['id', 'display_name', 'avatar'] }
            ]
        });

        res.json({ success: true, messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching messages" });
    }
};

exports.getInbox = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find business owned by user
        const business = await Business.findOne({ where: { owner_uid: userId } });
        if (!business) return res.status(404).json({ message: "Business not found" });

        // Fetch distinct conversations (grouped by user_id)
        // Functionally, we want the list of users who have messaged this business, with the last message.
        // Using Sequelize to get unique user_ids + last message is tricky.
        // Simplification: Get all messages, group in JS (not efficient for scale, but fine for MVP)

        const messages = await BusinessMessage.findAll({
            where: { business_id: business.id },
            order: [['created_at', 'DESC']],
            include: [
                { model: User, as: 'User', attributes: ['id', 'display_name', 'avatar'] }
            ]
        });

        // Group by User ID and take the first (latest) one
        const conversations = {};
        messages.forEach(msg => {
            if (!conversations[msg.user_id]) {
                conversations[msg.user_id] = {
                    user: msg.User,
                    lastMessage: msg.message,
                    time: msg.created_at,
                    unread: (!msg.is_read && msg.sender_type === 'user') ? 1 : 0 // Simple count logic
                };
            } else {
                if (!msg.is_read && msg.sender_type === 'user') {
                    conversations[msg.user_id].unread++;
                }
            }
        });

        res.json({ success: true, conversations: Object.values(conversations) });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching inbox" });
    }
};

exports.getSystemSettings = async (req, res) => {
    try {
        const { SystemSetting } = require('../models');
        const settings = await SystemSetting.findAll();
        const settingsObj = {};

        settings.forEach(s => {
            if (s.value === 'true') settingsObj[s.key] = true;
            else if (s.value === 'false') settingsObj[s.key] = false;
            else {
                try {
                    settingsObj[s.key] = s.value; // Keep as string or frontend parse
                } catch (e) {
                    settingsObj[s.key] = s.value;
                }
            }
        });

        // Filter for public/business safe keys if needed (for now exposing all is fine as they are general)
        res.json({ success: true, settings: settingsObj });
    } catch (error) {
        // Silent fail or empty
        res.json({ success: false, settings: {} });
    }
};

exports.submitVerification = async (req, res) => {
    try {
        const owner_uid = req.user.id;
        const business = await Business.findOne({ where: { owner_uid } });
        if (!business) {
            return res.status(404).json({ success: false, message: 'Business not found.' });
        }

        const documents = business.verification_documents || {};

        if (req.files) {
            if (req.files.vat20) documents.vat20 = `/uploads/${req.files.vat20[0].filename}`;
            if (req.files.certificate) documents.certificate = `/uploads/${req.files.certificate[0].filename}`;
            if (req.files.id_card) documents.id_card = `/uploads/${req.files.id_card[0].filename}`;

            if (req.files.others) {
                const otherFiles = req.files.others.map(f => `/uploads/${f.filename}`);
                documents.others = [...(documents.others || []), ...otherFiles];
            }
        }

        business.verification_documents = documents;
        business.verification_status = 'pending';
        business.changed('verification_documents', true);

        await business.save();

        res.json({ success: true, message: 'Verification documents submitted.', business });
    } catch (error) {
        console.error('Submit Verification Error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit verification.', error: error.message });
    }
};
