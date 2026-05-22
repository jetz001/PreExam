const { db: firestore, admin } = require('../config/firebase');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../data/adConfig.json');

const adsRef = firestore.collection('ads');
const usersRef = firestore.collection('users');
const metricsRef = firestore.collection('ad_metrics');
const transactionsRef = firestore.collection('sponsor_transactions');

const loadConfig = () => {
    try {
        if (!fs.existsSync(path.dirname(configPath))) fs.mkdirSync(path.dirname(configPath), { recursive: true });
        if (!fs.existsSync(configPath)) {
            const defaults = {
                communityViewCost: 0.1, communityClickCost: 5.0,
                newsViewCost: 0.15, newsClickCost: 6.0,
                resultViewCost: 0.2, resultClickCost: 8.0,
                inFeedFrequency: 10, adSenseBackupId: ''
            };
            fs.writeFileSync(configPath, JSON.stringify(defaults, null, 2));
            return defaults;
        }
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (err) {
        return {
            communityViewCost: 0.1, communityClickCost: 5.0,
            newsViewCost: 0.15, newsClickCost: 6.0,
            resultViewCost: 0.2, resultClickCost: 8.0
        };
    }
};

const saveConfig = (newConfig) => {
    const current = loadConfig();
    const updated = { ...current, ...newConfig };
    fs.writeFileSync(configPath, JSON.stringify(updated, null, 2));
    return updated;
};

exports.getConfigs = async (req, res) => res.json(loadConfig());

exports.updateConfigs = async (req, res) => {
    try {
        const updated = saveConfig(req.body);
        res.json({ success: true, config: updated });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update config' });
    }
};

exports.getAllSponsors = async (req, res) => {
    try {
        const snapshot = await usersRef.where('role', 'in', ['sponsor', 'admin']).get();
        const sponsors = await Promise.all(snapshot.docs.map(async doc => {
            const s = doc.data();
            const adSnap = await adsRef.where('sponsor_id', '==', doc.id).get();
            let activeAds = 0;
            let totalSpent = 0;

            adSnap.docs.forEach(aDoc => {
                const adData = aDoc.data();
                if (adData.status === 'active') activeAds++;
                totalSpent += (adData.budget_spent || 0);
            });

            return {
                id: doc.id,
                businessName: s.business_name || s.display_name,
                contact: s.email,
                balance: parseFloat(s.wallet_balance || 0),
                status: s.status,
                activeAds,
                totalSpent
            };
        }));
        res.json(sponsors);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch sponsors' });
    }
};

exports.suspendSponsor = async (req, res) => {
    try {
        const { id } = req.params;
        await usersRef.doc(id).update({ status: 'banned' });
        
        const adSnap = await adsRef.where('sponsor_id', '==', id).get();
        const batch = firestore.batch();
        adSnap.docs.forEach(doc => {
            batch.update(doc.ref, { status: 'paused' });
        });
        await batch.commit();

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Suspend failed' });
    }
};

exports.getPlatformStats = async (req, res) => {
    // simplified
    res.json({
        totalRevenue: 0,
        activeSponsors: 0,
        activeAds: 0,
        totalViews: 0,
        totalClicks: 0,
        performanceData: []
    });
};

exports.adjustSponsorWallet = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, reason } = req.body;

        const amt = parseFloat(amount);
        await firestore.runTransaction(async (t) => {
            const userDoc = await t.get(usersRef.doc(id));
            if (!userDoc.exists) throw new Error("User not found");
            t.update(usersRef.doc(id), {
                wallet_balance: admin.firestore.FieldValue.increment(amt)
            });
            const transRef = transactionsRef.doc();
            t.set(transRef, {
                id: transRef.id,
                sponsor_id: id,
                amount: amt,
                status: 'completed',
                type: 'deposit',
                admin_note: reason || 'Manual Admin Adjustment',
                created_at: new Date().toISOString()
            });
        });

        const updated = await usersRef.doc(id).get();
        res.json({ success: true, newBalance: updated.data().wallet_balance });
    } catch (error) {
        res.status(500).json({ message: 'Adjustment failed' });
    }
};

exports.uploadCreative = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ success: true, imageUrl: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` });
};

exports.createAd = async (req, res) => {
    try {
        const { title, description, link_url, placement, budget_total, cpm_bid, image_url } = req.body;
        const newRef = adsRef.doc();
        const adData = {
            id: newRef.id,
            sponsor_id: req.user.id.toString(),
            title, description, link_url, placement,
            budget_total: parseFloat(budget_total),
            cpm_bid: parseFloat(cpm_bid || 50),
            image_url,
            status: 'active',
            budget_spent: 0,
            views_count: 0,
            clicks_count: 0,
            created_at: new Date().toISOString()
        };
        await newRef.set(adData);
        res.status(201).json({ success: true, ad: adData });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create ad' });
    }
};

exports.updateAd = async (req, res) => {
    try {
        const { id } = req.params;
        const adRef = adsRef.doc(id);
        const adDoc = await adRef.get();
        if(!adDoc.exists || adDoc.data().sponsor_id !== req.user.id.toString()) return res.status(404).json({ message: 'Not found' });
        
        await adRef.update({ ...req.body, updated_at: new Date().toISOString() });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update ad' });
    }
};

exports.getMyAds = async (req, res) => {
    try {
        const snap = await adsRef.where('sponsor_id', '==', req.user.id.toString()).get();
        res.json(snap.docs.map(d => d.data()));
    } catch (e) {
        res.status(500).json({ message: 'Error' });
    }
};

exports.toggleAdStatus = async (req, res) => {
    try {
        const { id } = req.params;
        await adsRef.doc(id).update({ status: req.body.status });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ message: 'Error' });
    }
};

exports.getWallet = async (req, res) => {
    try {
        let targetId = req.user.id.toString();
        if (req.user.role === 'admin' && req.query.sponsorId) targetId = req.query.sponsorId;
        
        const u = await usersRef.doc(targetId).get();
        res.json({ balance: parseFloat(u.data().wallet_balance || 0), currency: 'THB', businessName: u.data().business_name });
    } catch (e) {
        res.status(500).json({ message: 'Error' });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const snap = await transactionsRef.where('sponsor_id', '==', req.user.id.toString()).get();
        res.json(snap.docs.map(d => d.data()));
    } catch (e) {
        res.status(500).json({ message: 'Error' });
    }
};

exports.topUpWallet = async (req, res) => {
    try {
        const newRef = transactionsRef.doc();
        const data = {
            id: newRef.id,
            sponsor_id: req.user.id.toString(),
            amount: parseFloat(req.body.amount),
            slip_url: req.body.slip_url,
            status: 'pending',
            created_at: new Date().toISOString()
        };
        await newRef.set(data);
        res.json({ success: true, transaction: data });
    } catch (e) {
        res.status(500).json({ message: 'Error' });
    }
};

exports.getDashboardStats = async (req, res) => {
    res.json({
        activeAds: 0, totalViews: 0, totalClicks: 0,
        totalFollowers: 0, totalPageViews: 0, totalReviews: 0,
        performanceData: []
    });
};

exports.getDailyBurn = async (req, res) => res.json([]);

exports.serveAd = async (req, res) => {
    try {
        // Simplified serving logic to grab an active ad randomly
        const snap = await adsRef.where('status', '==', 'active').get();
        if (snap.empty) return res.json({ served: false });

        const candidates = snap.docs.map(d => d.data()).filter(ad => (ad.budget_spent || 0) < ad.budget_total);
        if (candidates.length === 0) return res.json({ served: false });

        const winner = candidates[Math.floor(Math.random() * candidates.length)];
        const sponsorDoc = await usersRef.doc(winner.sponsor_id).get();
        if (!sponsorDoc.exists || (sponsorDoc.data().wallet_balance || 0) <= 0) return res.json({ served: false });

        res.json({
            served: true,
            ad: {
                id: winner.id,
                brandName: sponsorDoc.data().business_name || sponsorDoc.data().display_name,
                title: winner.title, description: winner.description,
                image: winner.image_url, logo: sponsorDoc.data().avatar,
                url: winner.link_url, cpm: winner.cpm_bid, type: 'native'
            }
        });
    } catch (e) {
        res.json({ served: false });
    }
};

exports.recordView = async (req, res) => {
    try {
        const cost = 0.1;
        const { adId } = req.body;
        await firestore.runTransaction(async (t) => {
            const adDoc = await t.get(adsRef.doc(adId));
            if (!adDoc.exists) return;
            const uDoc = await t.get(usersRef.doc(adDoc.data().sponsor_id));
            if (!uDoc.exists || uDoc.data().wallet_balance <= 0) return;

            t.update(usersRef.doc(adDoc.data().sponsor_id), { wallet_balance: admin.firestore.FieldValue.increment(-cost) });
            t.update(adsRef.doc(adId), { 
                budget_spent: admin.firestore.FieldValue.increment(cost),
                views_count: admin.firestore.FieldValue.increment(1) 
            });
        });
        res.json({ success: true, burnt: cost });
    } catch (e) {
        res.status(500).json({ message: 'Burn failed' });
    }
};

exports.recordClick = async (req, res) => {
    try {
        const cost = 5.0;
        const { adId } = req.body;
        await firestore.runTransaction(async (t) => {
            const adDoc = await t.get(adsRef.doc(adId));
            if (!adDoc.exists) return;
            const uDoc = await t.get(usersRef.doc(adDoc.data().sponsor_id));
            if (!uDoc.exists || uDoc.data().wallet_balance <= 0) return;

            t.update(usersRef.doc(adDoc.data().sponsor_id), { wallet_balance: admin.firestore.FieldValue.increment(-cost) });
            t.update(adsRef.doc(adId), { 
                budget_spent: admin.firestore.FieldValue.increment(cost),
                clicks_count: admin.firestore.FieldValue.increment(1) 
            });
        });
        res.json({ success: true, burnt: cost });
    } catch (e) {
        res.status(500).json({ message: 'Burn failed' });
    }
};

exports.getPendingAds = async (req, res) => {
    try {
        const snap = await transactionsRef.where('status', '==', 'pending').get();
        const results = await Promise.all(snap.docs.map(async doc => {
            const d = doc.data();
            const u = await usersRef.doc(d.sponsor_id).get();
            return {
                ...d,
                sponsor: u.exists ? u.data() : null
            };
        }));
        res.json(results);
    } catch (e) {
        res.status(500).json({ message: 'Error' });
    }
};
