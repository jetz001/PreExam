const { db: firestore, admin } = require('../config/firebase');

const usersRef = firestore.collection('users');
const paymentsRef = firestore.collection('payments');
const businessesRef = firestore.collection('businesses');
const postsRef = firestore.collection('business_posts');
const threadsRef = firestore.collection('threads');
const reportsRef = firestore.collection('reported_content');
const ticketsRef = firestore.collection('support_tickets');
const settingsRef = firestore.collection('system_settings');
const logsRef = firestore.collection('system_logs');
const examResultsRef = firestore.collection('exam_results');

exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = (await usersRef.count().get()).data().count;
        const premiumUsers = (await usersRef.where('plan_type', '==', 'premium').count().get()).data().count;
        const totalRevenue = 50000; // Mocked for migration
        const monthlyRevenue = 15000;
        
        res.json({
            revenue: { total: totalRevenue, monthly: monthlyRevenue, yearly: 50000, pending: 0, trend: [] },
            conversionRate: totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : 0,
            activeUsers: 100,
            commercialViability: [],
            painPoints: [],
            communityHealth: { recentReports: 0, mau: totalUsers }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const snapshot = await usersRef.orderBy('created_at', 'desc').limit(100).get();
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, plan_type, status } = req.body;
        
        const updateData = {};
        if (role) updateData.role = role;
        if (plan_type) updateData.plan_type = plan_type;
        if (status) updateData.status = status;

        await usersRef.doc(id).update(updateData);
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        await usersRef.doc(req.params.id).update({ status: req.body.status });
        res.json({ message: 'User status updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user status' });
    }
};

exports.updateUserPermissions = async (req, res) => {
    try {
        await usersRef.doc(req.params.id).update({ admin_permissions: req.body.permissions });
        res.json({ message: 'User permissions updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user permissions' });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const snapshot = await paymentsRef.orderBy('created_at', 'desc').get();
        const items = await Promise.all(snapshot.docs.map(async doc => {
            const data = doc.data();
            const userDoc = await usersRef.doc(data.user_id).get();
            return {
                id: doc.id,
                type: data.type === 'PLAN_PURCHASE' ? 'subscription' : 'topup',
                amount: data.amount,
                status: data.status,
                slip_url: data.metadata?.slip_url || data.receipt_url || null,
                created_at: data.created_at,
                user_display_name: userDoc.exists ? userDoc.data().display_name : 'Unknown',
                user_email: userDoc.exists ? userDoc.data().email : 'Unknown'
            };
        }));
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments' });
    }
};

exports.approvePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body;

        const pRef = paymentsRef.doc(id);
        const pDoc = await pRef.get();
        if (!pDoc.exists) return res.status(404).json({ message: 'Payment not found' });

        const data = pDoc.data();
        await pRef.update({ status: 'SUCCESS' });

        if (type === 'topup' || data.type === 'WALLET_TOPUP') {
            await usersRef.doc(data.user_id).update({ wallet_balance: admin.firestore.FieldValue.increment(data.amount) });
        } else {
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30);
            await usersRef.doc(data.user_id).update({ plan_type: 'premium', premium_expiry: expiry.toISOString() });
        }

        res.json({ message: 'Payment approved' });
    } catch (error) {
        res.status(500).json({ message: 'Error approving payment' });
    }
};

exports.rejectPayment = async (req, res) => {
    try {
        await paymentsRef.doc(req.params.id).update({ status: 'rejected' });
        res.json({ message: 'Payment rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting payment' });
    }
};

exports.getMessages = async (req, res) => res.json([]);

exports.broadcastMessage = async (req, res) => res.json({ success: true, message: 'Broadcast sent' });

exports.getThreads = async (req, res) => {
    try {
        const snapshot = await threadsRef.orderBy('created_at', 'desc').limit(20).get();
        const formattedThreads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ threads: formattedThreads, pagination: { total: 20, page: 1, pages: 1 } });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching threads' });
    }
};

exports.deleteThread = async (req, res) => {
    try {
        await threadsRef.doc(req.params.id).delete();
        res.json({ success: true, message: 'Thread deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting thread' });
    }
};

exports.getReports = async (req, res) => res.json([]);
exports.resolveReport = async (req, res) => res.json({ success: true, message: 'Report processed' });

exports.getPendingAds = async (req, res) => {
    try {
        const snapshot = await postsRef.where('is_boosted', '==', true).where('ad_status', '==', 'pending').get();
        res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching ads' });
    }
};

exports.approveAd = async (req, res) => {
    try {
        await postsRef.doc(req.params.id).update({ ad_status: 'approved' });
        res.json({ success: true, message: 'Ad approved' });
    } catch (error) {
        res.status(500).json({ message: 'Error approving ad' });
    }
};

exports.rejectAd = async (req, res) => {
    try {
        await postsRef.doc(req.params.id).update({ ad_status: 'rejected', is_boosted: false });
        res.json({ success: true, message: 'Ad rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting ad' });
    }
};

exports.getTickets = async (req, res) => res.json({ success: true, tickets: [] });
exports.getTransactions = async (req, res) => res.json({ success: true, transactions: [] });

exports.getBusinesses = async (req, res) => {
    try {
        const snapshot = await businessesRef.orderBy('created_at', 'desc').get();
        res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching businesses' });
    }
};

exports.verifyBusiness = async (req, res) => {
    try {
        await businessesRef.doc(req.params.id).update({ is_verified: req.body.is_verified });
        res.json({ success: true, message: 'Business verified' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating verification' });
    }
};

exports.deleteBusiness = async (req, res) => {
    try {
        await businessesRef.doc(req.params.id).delete();
        res.json({ success: true, message: 'Business deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting business' });
    }
};

exports.getSystemSettings = async (req, res) => {
    try {
        const snapshot = await settingsRef.get();
        const settingsObj = {};
        snapshot.docs.forEach(doc => { settingsObj[doc.id] = doc.data().value; });
        const defaults = { announcement_text: '', announcement_active: false, announcement_type: 'info', blacklisted_words: '' };
        res.json({ ...defaults, ...settingsObj });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings' });
    }
};

exports.updateSystemSettings = async (req, res) => {
    try {
        const settings = req.body;
        const batch = firestore.batch();
        for (const [key, value] of Object.entries(settings)) {
            batch.set(settingsRef.doc(key), { value });
        }
        await batch.commit();
        res.json({ success: true, message: 'Settings updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating settings' });
    }
};

exports.getUserHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const userDoc = await usersRef.doc(id).get();
        if (!userDoc.exists) return res.status(404).json({ message: 'User not found' });
        
        const examSnap = await examResultsRef.where('user_id', '==', id).limit(20).get();
        const pSnap = await paymentsRef.where('user_id', '==', id).limit(10).get();
        
        res.json({
            success: true,
            user: { id: userDoc.id, ...userDoc.data() },
            examHistory: examSnap.docs.map(d => d.data()),
            paymentHistory: pSnap.docs.map(d => d.data())
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history' });
    }
};

exports.getUserLogs = async (req, res) => {
    try {
        const snapshot = await logsRef.where('user_id', '==', req.params.id).limit(10).get();
        res.json({ success: true, logs: snapshot.docs.map(d => d.data()) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user logs' });
    }
};
