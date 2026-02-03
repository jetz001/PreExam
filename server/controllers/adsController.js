const { Ad, User, AdMetric, SponsorTransaction, sequelize } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../data/adConfig.json');

// Helper to ensure directory exists and load config
const loadConfig = () => {
    try {
        if (!fs.existsSync(path.dirname(configPath))) {
            fs.mkdirSync(path.dirname(configPath), { recursive: true });
        }
        if (!fs.existsSync(configPath)) {
            const defaults = {
                // Community
                communityViewCost: 0.1,
                communityClickCost: 5.0,
                // News
                newsViewCost: 0.15,
                newsClickCost: 6.0,
                // Exam Result
                resultViewCost: 0.2,
                resultClickCost: 8.0,

                inFeedFrequency: 10,
                adSenseBackupId: ''
            };
            fs.writeFileSync(configPath, JSON.stringify(defaults, null, 2));
            return defaults;
        }
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (err) {
        console.error("Error loading ad config:", err);
        return {
            communityViewCost: 0.1, communityClickCost: 5.0,
            newsViewCost: 0.15, newsClickCost: 6.0,
            resultViewCost: 0.2, resultClickCost: 8.0
        };
    }
};

const saveConfig = (newConfig) => {
    try {
        const current = loadConfig();
        const updated = { ...current, ...newConfig };
        fs.writeFileSync(configPath, JSON.stringify(updated, null, 2));
        return updated;
    } catch (err) {
        console.error("Error saving ad config:", err);
        throw err;
    }
};

exports.getConfigs = async (req, res) => {
    const config = loadConfig();
    res.json(config);
};

exports.updateConfigs = async (req, res) => {
    try {
        const {
            communityViewCost, communityClickCost,
            newsViewCost, newsClickCost,
            resultViewCost, resultClickCost,
            inFeedFrequency, adSenseBackupId
        } = req.body;

        const updated = saveConfig({
            communityViewCost: Number(communityViewCost), communityClickCost: Number(communityClickCost),
            newsViewCost: Number(newsViewCost), newsClickCost: Number(newsClickCost),
            resultViewCost: Number(resultViewCost), resultClickCost: Number(resultClickCost),
            inFeedFrequency: Number(inFeedFrequency),
            adSenseBackupId
        });
        res.json({ success: true, config: updated });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update config' });
    }
};

// --- Admin Actions ---

exports.getAllSponsors = async (req, res) => {
    try {
        // DEBUG: Check ads mapping
        const allAds = await Ad.findAll({ attributes: ['id', 'sponsor_id', 'status'] });
        console.log("[DEBUG] All Ads in DB:", JSON.stringify(allAds, null, 2));

        const sponsors = await User.findAll({
            where: { role: ['sponsor', 'admin'] }, // Include admins for testing
            attributes: ['id', 'business_name', 'email', 'phone_number', 'wallet_balance', 'status', 'display_name'],
            include: [{
                model: Ad,
                as: 'ads',
                attributes: ['id', 'status', 'budget_spent']
            }]
        });

        // Format for frontend
        const formatted = sponsors.map(s => {
            const ads = s.ads || [];
            if (ads.length > 0) {
                console.log(`[DEBUG] Sponsor ${s.id} has ${ads.length} ads.First budget_spent: ${ads[0].budget_spent} `);
            } else {
                console.log(`[DEBUG] Sponsor ${s.id} has 0 ads.`);
            }

            const activeCount = ads.filter(a => a.status === 'active').length;
            const spentSum = ads.reduce((sum, a) => sum + Number(a.budget_spent || 0), 0);

            console.log(`[DEBUG] Sponsor ${s.id}: active = ${activeCount}, spent = ${spentSum}, balance = ${s.wallet_balance} `);

            return {
                id: s.id,
                businessName: s.business_name || s.display_name,
                contact: s.email,
                balance: parseFloat(s.wallet_balance),
                status: s.status,
                activeAds: activeCount,
                totalSpent: spentSum
            };
        });

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch sponsors' });
    }
};

exports.suspendSponsor = async (req, res) => {
    // ... (keep existing suspendSponsor)
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.status = 'banned';
        await user.save();

        // Pause all their ads
        await Ad.update({ status: 'paused' }, { where: { sponsor_id: id } });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Suspend failed' });
    }
};

exports.getPlatformStats = async (req, res) => {
    // ...
    try {
        const totalRevenue = await Ad.sum('budget_spent') || 0;
        const activeSponsors = await User.count({ where: { role: 'sponsor', status: 'active' } });
        // ... (rest of getPlatformStats)
        res.json({
            totalRevenue,
            activeSponsors,
            activeAds: await Ad.count({ where: { status: 'active' } }),
            totalViews: await Ad.sum('views_count') || 0,
            totalClicks: await Ad.sum('clicks_count') || 0,
            performanceData: [] // Mock for now
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Stats error' });
    }
};

// ... (serveAd logic)

exports.recordView = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { adId } = req.body;
        const ad = await Ad.findByPk(adId, { include: ['sponsor'], transaction: t });

        if (!ad) {
            await t.rollback();
            return res.status(404).json({ message: 'Ad not found' });
        }

        // Calculate Cost
        const cost = ad.cpm_bid / 1000.0;

        // Check balances again to be safe
        // RELAXED CHECK: Allow small overdraft for updated stats in demo
        if (ad.sponsor.wallet_balance < -100) {
            // Only stop if they are deeply in debt
            await t.rollback();
            return res.status(400).json({ message: 'Insufficient funds' });
        }
        const totalViews = await Ad.sum('views_count') || 0;

        res.json({
            totalRevenue,
            activeSponsors,
            totalViews,
            revenueTrend: [] // TODO: Time series
        });
    } catch (error) {
        res.status(500).json({ message: 'Stats failed' });
    }
};

exports.adjustSponsorWallet = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, reason } = req.body;

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.increment('wallet_balance', { by: parseFloat(amount) });

        await SponsorTransaction.create({
            sponsor_id: id,
            amount: amount,
            status: 'completed',
            type: 'deposit',
            admin_note: reason || 'Manual Admin Adjustment'
        });

        const updatedUser = await User.findByPk(id);
        res.json({ success: true, newBalance: parseFloat(updatedUser.wallet_balance) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Adjustment failed' });
    }
};

// --- Sponsor Actions ---

exports.uploadCreative = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    // Return the URL for the frontend to use in createAd
    const protocol = req.protocol;
    const host = req.get('host');
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.json({ success: true, imageUrl });
};

exports.createAd = async (req, res) => {
    try {
        const { title, description, link_url, placement, budget_total, cpm_bid, image_url } = req.body;
        const sponsorId = req.user.id; // From auth middleware

        // Basic validation
        if (!title || !link_url || !budget_total) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newAd = await Ad.create({
            sponsor_id: sponsorId,
            title,
            description,
            link_url,
            placement,
            budget_total,
            cpm_bid: cpm_bid || 50,
            image_url,
            status: 'active' // Auto-active for now
        });

        res.status(201).json({ success: true, ad: newAd });
    } catch (error) {
        console.error('Create Ad Error:', error);
        res.status(500).json({ message: 'Failed to create ad' });
    }
};

exports.updateAd = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, link_url, placement, budget_total, cpm_bid, image_url } = req.body;
        const sponsorId = req.user.id;

        const ad = await Ad.findOne({ where: { id, sponsor_id: sponsorId } });
        if (!ad) return res.status(404).json({ message: 'Ad not found' });

        // Update fields if provided
        if (title) ad.title = title;
        if (description) ad.description = description;
        if (link_url) ad.link_url = link_url;
        if (placement) ad.placement = placement;
        if (budget_total) ad.budget_total = budget_total;
        if (cpm_bid) ad.cpm_bid = cpm_bid;
        if (image_url) ad.image_url = image_url;

        await ad.save();

        res.json({ success: true, ad });
    } catch (error) {
        console.error('Update Ad Error:', error);
        res.status(500).json({ message: 'Failed to update ad' });
    }
};

exports.getMyAds = async (req, res) => {
    try {
        const sponsorId = req.user.id;
        const ads = await Ad.findAll({
            where: { sponsor_id: sponsorId },
            order: [['created_at', 'DESC']]
        });
        res.json(ads);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch ads' });
    }
};

exports.toggleAdStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'active' or 'paused'
        const sponsorId = req.user.id;

        const ad = await Ad.findOne({ where: { id, sponsor_id: sponsorId } });
        if (!ad) return res.status(404).json({ message: 'Ad not found' });

        ad.status = status;
        await ad.save();

        res.json({ success: true, ad });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update status' });
    }
};

exports.getWallet = async (req, res) => {
    try {
        // Support "View As" override for Admin, otherwise filtered by logged-in user
        let targetId = req.user.id;
        if (req.user.role === 'admin' && req.query.sponsorId) {
            targetId = req.query.sponsorId;
        }

        const user = await User.findByPk(targetId, {
            attributes: ['id', 'business_name', 'wallet_balance']
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            balance: parseFloat(user.wallet_balance || 0),
            currency: 'THB',
            businessName: user.business_name
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch wallet' });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const sponsorId = req.user.id;
        const transactions = await SponsorTransaction.findAll({
            where: { sponsor_id: sponsorId },
            order: [['created_at', 'DESC']]
        });
        res.json(transactions);
    } catch (error) {
        console.error('Get Transactions Error:', error);
        res.status(500).json({ message: 'Failed to fetch transactions' });
    }
};

exports.topUpWallet = async (req, res) => {
    try {
        const { amount, slip_url } = req.body;
        const sponsorId = req.user.id;

        const transaction = await SponsorTransaction.create({
            sponsor_id: sponsorId,
            amount,
            slip_url,
            status: 'pending'
        });

        res.status(201).json({ success: true, transaction });
    } catch (error) {
        res.status(500).json({ message: 'Top-up failed' });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        let sponsorId = req.user.id;
        if (req.user.role === 'admin' && req.query.sponsorId) {
            sponsorId = req.query.sponsorId;
        }

        const ads = await Ad.findAll({ where: { sponsor_id: sponsorId } });

        // Aggregate
        const activeAds = ads.filter(a => a.status === 'active').length;
        const totalViews = ads.reduce((sum, a) => sum + (a.views_count || 0), 0);
        const totalClicks = ads.reduce((sum, a) => sum + (a.clicks_count || 0), 0);

        // Fetch Business specific stats (Followers, Page Views, Reviews)
        const business = await sequelize.models.Business.findOne({ where: { owner_uid: sponsorId } });
        const totalFollowers = business?.stats?.followers || 0;
        const totalPageViews = business?.stats?.views || 0;
        const totalReviews = business?.rating_count || 0;

        // Real Chart Data
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const metrics = await AdMetric.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('AdMetric.created_at')), 'date'],
                'type',
                [sequelize.fn('COUNT', sequelize.col('AdMetric.id')), 'count']
            ],
            include: [{
                model: Ad,
                attributes: [],
                where: { sponsor_id: sponsorId }
            }],
            where: {
                created_at: { [Op.gte]: sevenDaysAgo }
            },
            group: [sequelize.fn('DATE', sequelize.col('AdMetric.created_at')), 'type'],
            raw: true
        });

        // Initialize last 7 days with 0
        const performanceData = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

            const dayMetrics = metrics.filter(m => m.date === dateStr);
            const views = dayMetrics.find(m => m.type === 'view')?.count || 0;
            const clicks = dayMetrics.find(m => m.type === 'click')?.count || 0;

            performanceData.push({
                name: dayName, // Mon, Tue, etc.
                fullDate: dateStr, // For debugging or detailed tooltip
                views: parseInt(views),
                clicks: parseInt(clicks)
            });
        }

        res.json({
            activeAds,
            totalViews,
            totalClicks,
            totalFollowers,
            totalPageViews,
            totalReviews,
            performanceData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Stats error' });
    }
};

exports.getDailyBurn = async (req, res) => {
    try {
        const sponsorId = req.user.id;

        // Group by Date and Ad, Sum Cost
        const dailyBurn = await AdMetric.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('AdMetric.created_at')), 'date'],
                [sequelize.fn('SUM', sequelize.col('cost')), 'total_cost'],
                'ad_id'
            ],
            include: [{
                model: Ad,
                // as: 'ad', // Default alias in index.js is 'Ad'
                attributes: ['title', 'id'],
                where: { sponsor_id: sponsorId }
            }],
            group: [sequelize.fn('DATE', sequelize.col('AdMetric.created_at')), 'ad_id', 'Ad.id'],
            order: [[sequelize.fn('DATE', sequelize.col('AdMetric.created_at')), 'DESC']],
            limit: 20 // Recent transactions
        });

        // Format for frontend
        const formatted = dailyBurn.map(item => ({
            date: item.get('date'),
            amount: parseFloat(item.get('total_cost')),
            adTitle: item.Ad ? item.Ad.title : 'Unknown Ad',
            adId: item.ad_id
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Daily Burn Error:', error);
        res.status(500).json({ message: 'Failed to fetch daily burn' });
    }
};

// --- Ad Serving Logic ---

exports.serveAd = async (req, res) => {
    try {
        const { placement } = req.query; // 'feed', 'result', 'community', 'news'

        // Flexible Placement Logic:
        // If asking for 'result' or 'news', also accept generic 'feed' ads so we have inventory.
        // If asking for 'community', accept 'feed' as well.
        let placementFilter = placement || 'feed';
        if (['news', 'result', 'community'].includes(placement)) {
            placementFilter = { [Op.or]: [placement, 'feed', 'community', 'in-feed'] };
        }

        const candidates = await Ad.findAll({
            where: {
                status: 'active',
                placement: placementFilter,
                // simple check: budget_spent < budget_total
                budget_spent: { [Op.lt]: sequelize.col('budget_total') }
            },
            include: [{
                model: User,
                as: 'sponsor',
                where: {
                    wallet_balance: { [Op.gt]: 0 } // Strict check: Wallet must be positive
                },
                attributes: ['id', 'wallet_balance', 'business_name', 'display_name', 'avatar']
            }]
        });

        if (candidates.length === 0) {
            return res.json({ served: false });
        }

        // Weighted Random selection based on CPM? Or just random.
        const winner = candidates[Math.floor(Math.random() * candidates.length)];

        res.json({
            served: true,
            ad: {
                id: winner.id,
                brandName: winner.sponsor.business_name || winner.sponsor.display_name,
                title: winner.title,
                description: winner.description,
                image: winner.image_url, // Map image_url -> image
                logo: winner.sponsor.avatar, // Use user avatar as logo
                url: winner.link_url, // Map link_url -> url
                cpm: winner.cpm_bid,
                type: 'native'
            }
        });

    } catch (error) {
        console.error('Serve Ad Error:', error);
        res.status(500).json({ served: false });
    }
};

exports.recordView = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { adId, placement = 'community' } = req.body;
        const ad = await Ad.findByPk(adId, { include: ['sponsor'], transaction: t });

        if (!ad) {
            await t.rollback();
            return res.status(404).json({ message: 'Ad not found' });
        }

        // Calculate Cost based on placement
        const config = loadConfig();
        let cost = 0.1; // Default

        switch (placement) {
            case 'news': cost = Number(config.newsViewCost || 0.15); break;
            case 'result': cost = Number(config.resultViewCost || 0.2); break;
            case 'community':
            default:
                cost = Number(config.communityViewCost || 0.1);
                break;
        }

        // Check balances again to be safe
        // STRICT CHECK: Wallet must be positive to pay for view
        if (ad.sponsor.wallet_balance <= 0) {
            // Out of funds!
            await t.rollback();
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        // 1. Deduct from Sponsor Wallet
        await User.decrement('wallet_balance', { by: cost, where: { id: ad.sponsor_id }, transaction: t });

        // 2. Add to Ad Spend
        await Ad.increment({ budget_spent: cost, views_count: 1 }, { where: { id: adId }, transaction: t });

        // 3. Log Metric
        await AdMetric.create({
            ad_id: adId,
            type: 'view',
            cost: cost,
            viewer_id: req.user ? req.user.id : null,
            ip_address: req.ip
        }, { transaction: t });

        await t.commit();
        res.json({ success: true, burnt: cost });

    } catch (error) {
        await t.rollback();
        console.error('Burn Error:', error);
        res.status(500).json({ message: 'Burn failed' });
    }
};

exports.recordClick = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { adId, placement = 'community' } = req.body;
        console.log(`[AdClick] recording click for Ad ID: ${adId} at ${placement}`);

        const ad = await Ad.findByPk(adId, { include: ['sponsor'], transaction: t });

        if (!ad) {
            await t.rollback();
            return res.status(404).json({ message: 'Ad not found' });
        }

        // Calculate Cost (CPC) based on placement
        const config = loadConfig();
        let cost = 5.0;

        switch (placement) {
            case 'news': cost = Number(config.newsClickCost || 6.0); break;
            case 'result': cost = Number(config.resultClickCost || 8.0); break;
            case 'community':
            default:
                cost = Number(config.communityClickCost || 5.0);
                break;
        }
        console.log(`[AdClick] Cost: ${cost}, Sponsor Balance: ${ad.sponsor.wallet_balance}`);

        // Check balances (Strict check)
        if (ad.sponsor.wallet_balance <= 0) {
            console.log(`[AdClick] Insufficient funds. Balance: ${ad.sponsor.wallet_balance}`);
            await t.rollback();
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        // 1. Deduct from Sponsor Wallet
        await User.decrement('wallet_balance', { by: cost, where: { id: ad.sponsor_id }, transaction: t });

        // 2. Add to Ad Spend
        await Ad.increment({ budget_spent: cost, clicks_count: 1 }, { where: { id: adId }, transaction: t });

        // 3. Log Metric
        await AdMetric.create({
            ad_id: adId,
            type: 'click',
            cost: cost,
            viewer_id: req.user ? req.user.id : null,
            ip_address: req.ip
        }, { transaction: t });

        await t.commit();
        res.json({ success: true, burnt: cost });

    } catch (error) {
        await t.rollback();
        console.error('Click Burn Error:', error);
        res.status(500).json({ message: 'Click Burn failed' });
    }
};

exports.getPendingAds = async (req, res) => {
    try {
        // "Pending Ads" in the UI refers to Pending Top-up Slips (SponsorTransactions)
        const transactions = await SponsorTransaction.findAll({
            where: { status: 'pending' },
            include: [{
                model: User,
                as: 'sponsor',
                attributes: ['id', 'business_name', 'email', 'phone_number']
            }],
            order: [['created_at', 'ASC']]
        });
        res.json(transactions);
    } catch (error) {
        console.error('Get Pending Pay Slips Error:', error);
        res.status(500).json({ message: 'Failed to fetch pending slips' });
    }
};
