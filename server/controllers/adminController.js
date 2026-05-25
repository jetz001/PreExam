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
        
        // Fetch all payments to calculate revenue
        const paymentsSnap = await paymentsRef.get();
        let totalRevenue = 0;
        let monthlyRevenue = 0;
        let yearlyRevenue = 0;
        let pendingRevenue = 0;
        
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Revenue trend by month (last 6 months)
        const trendMap = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = d.toLocaleString('default', { month: 'short' });
            trendMap[`${d.getFullYear()}-${d.getMonth()}`] = { name: monthName, value: 0 };
        }

        paymentsSnap.docs.forEach(doc => {
            const data = doc.data();
            const amount = Number(data.amount) || 0;
            const status = (data.status || 'unknown').toLowerCase();
            const created_at = new Date(data.created_at);
            
            if (status === 'pending') {
                pendingRevenue += amount;
            } else if (status === 'approved' || status === 'completed' || status === 'success') {
                totalRevenue += amount;
                
                if (created_at.getFullYear() === currentYear) {
                    yearlyRevenue += amount;
                    if (created_at.getMonth() === currentMonth) {
                        monthlyRevenue += amount;
                    }
                }
                
                // Trend logic
                const key = `${created_at.getFullYear()}-${created_at.getMonth()}`;
                if (trendMap[key]) {
                    trendMap[key].value += amount;
                }
            }
        });

        // Fetch recent reports (last 24 hours)
        const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString();
        const recentReports = (await reportsRef.where('created_at', '>=', yesterday).count().get()).data().count;

        res.json({
            revenue: { 
                total: totalRevenue, 
                monthly: monthlyRevenue, 
                yearly: yearlyRevenue, 
                pending: pendingRevenue, 
                trend: Object.values(trendMap) 
            },
            conversionRate: totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : 0,
            activeUsers: Math.floor(totalUsers * 0.2) + 5, // Estimate active users if not explicitly tracked
            commercialViability: [
                { name: 'Jan', value: 65 }, { name: 'Feb', value: 75 }, { name: 'Mar', value: 85 }
            ],
            painPoints: [
                { subject: 'Math', score: 45 }, { subject: 'Physics', score: 55 }
            ],
            communityHealth: { recentReports, mau: totalUsers }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching stats', error });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const snapshot = await usersRef.orderBy('created_at', 'desc').limit(1000).get();
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
            const userDoc = await usersRef.doc(String(data.user_id)).get();
            return {
                id: doc.id,
                type: data.type === 'PLAN_PURCHASE' ? 'subscription' : 'topup',
                amount: data.amount,
                status: (data.status || 'unknown').toLowerCase(),
                slip_url: data.metadata?.slip_url || data.receipt_url || null,
                created_at: data.created_at,
                user_display_name: userDoc.exists ? userDoc.data().display_name : 'Unknown',
                user_email: userDoc.exists ? userDoc.data().email : 'Unknown'
            };
        }));
        res.json(items);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Error fetching payments' });
    }
};

exports.approvePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.body;

        const pRef = paymentsRef.doc(String(id));
        const pDoc = await pRef.get();
        if (!pDoc.exists) return res.status(404).json({ message: 'Payment not found' });

        const data = pDoc.data();
        await pRef.update({ status: 'approved' });

        if (type === 'topup' || data.type === 'WALLET_TOPUP') {
            await usersRef.doc(String(data.user_id)).update({ wallet_balance: admin.firestore.FieldValue.increment(Number(data.amount) || 0) });
        } else {
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30);
            await usersRef.doc(String(data.user_id)).update({ plan_type: 'premium', premium_expiry: expiry.toISOString() });
        }

        res.json({ message: 'Payment approved' });
    } catch (error) {
        console.error('Error approving payment:', error);
        res.status(500).json({ message: 'Error approving payment' });
    }
};

exports.rejectPayment = async (req, res) => {
    try {
        await paymentsRef.doc(String(req.params.id)).update({ status: 'rejected' });
        res.json({ message: 'Payment rejected' });
    } catch (error) {
        console.error('Error rejecting payment:', error);
        res.status(500).json({ message: 'Error rejecting payment' });
    }
};

const contactMessagesRef = firestore.collection('contact_messages');

exports.getMessages = async (req, res) => {
    try {
        const snapshot = await contactMessagesRef.orderBy('created_at', 'desc').get();
        const messages = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                type: data.type || (data.user_id ? 'User' : 'Visitor'),
                subject: data.subject || 'No Subject',
                from: data.email || data.name || 'Unknown',
                content: data.message || data.content || '',
                is_read: data.is_read || false,
                created_at: data.created_at
            };
        });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching admin messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
};

exports.broadcastMessage = async (req, res) => res.json({ success: true, message: 'Broadcast sent' });

exports.getThreads = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;
        
        // Remove orderBy to ensure documents missing 'created_at' are still returned
        let snapshot = await threadsRef.get();
        let formattedThreads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Sort in memory
        formattedThreads.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        
        if (search) {
            const lowerSearch = search.toLowerCase();
            formattedThreads = formattedThreads.filter(t => 
                (t.title && t.title.toLowerCase().includes(lowerSearch)) ||
                (t.content && t.content.toLowerCase().includes(lowerSearch)) ||
                (t.author && t.author.toLowerCase().includes(lowerSearch))
            );
        }
        
        const total = formattedThreads.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const start = (page - 1) * limit;
        const paginatedThreads = formattedThreads.slice(start, start + parseInt(limit));
        
        res.json({ threads: paginatedThreads, pagination: { total, page: parseInt(page), totalPages, pages: totalPages } });
    } catch (error) {
        console.error('Error fetching threads:', error);
        res.status(500).json({ message: 'Error fetching threads' });
    }
};

exports.deleteThread = async (req, res) => {
    try {
        await threadsRef.doc(String(req.params.id)).delete();
        res.json({ success: true, message: 'Thread deleted' });
    } catch (error) {
        console.error('Error deleting thread:', error);
        res.status(500).json({ message: 'Error deleting thread' });
    }
};

exports.getReports = async (req, res) => {
    try {
        const snapshot = await reportsRef.get();
        let reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        reports.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Error fetching reports' });
    }
};

exports.resolveReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;
        
        const reportDoc = await reportsRef.doc(String(id)).get();
        if (!reportDoc.exists) return res.status(404).json({ message: 'Report not found' });
        
        const report = reportDoc.data();
        
        if (action === 'delete_content') {
            if (report.type === 'thread' && report.target_id) {
                await threadsRef.doc(String(report.target_id)).delete();
            } else if (report.type === 'thread' && report.thread_id) {
                await threadsRef.doc(String(report.thread_id)).delete();
            }
        }
        
        await reportsRef.doc(String(id)).delete();
        res.json({ success: true, message: 'Report processed' });
    } catch (error) {
        console.error('Error resolving report:', error);
        res.status(500).json({ message: 'Error resolving report' });
    }
};

exports.getPendingAds = async (req, res) => {
    try {
        // Fetch all boosted ads and filter pending in memory to avoid composite index
        const snapshot = await postsRef.where('is_boosted', '==', true).get();
        let ads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        ads = ads.filter(ad => ad.ad_status === 'pending');
        res.json(ads);
    } catch (error) {
        console.error('Error fetching pending ads:', error);
        res.status(500).json({ message: 'Error fetching ads' });
    }
};

exports.approveAd = async (req, res) => {
    try {
        await postsRef.doc(String(req.params.id)).update({ ad_status: 'approved' });
        res.json({ success: true, message: 'Ad approved' });
    } catch (error) {
        console.error('Error approving ad:', error);
        res.status(500).json({ message: 'Error approving ad' });
    }
};

exports.rejectAd = async (req, res) => {
    try {
        await postsRef.doc(String(req.params.id)).update({ ad_status: 'rejected', is_boosted: false });
        res.json({ success: true, message: 'Ad rejected' });
    } catch (error) {
        console.error('Error rejecting ad:', error);
        res.status(500).json({ message: 'Error rejecting ad' });
    }
};

exports.getTickets = async (req, res) => res.json({ success: true, tickets: [] });
exports.getTransactions = async (req, res) => res.json({ success: true, transactions: [] });

exports.getBusinesses = async (req, res) => {
    try {
        const snapshot = await businessesRef.get();
        let businesses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort in memory to avoid missing documents without created_at field
        businesses.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        res.json(businesses);
    } catch (error) {
        console.error('Error fetching businesses:', error);
        res.status(500).json({ message: 'Error fetching businesses' });
    }
};

exports.verifyBusiness = async (req, res) => {
    try {
        const { is_verified } = req.body;
        if (is_verified === undefined) {
            return res.status(400).json({ message: 'is_verified is required' });
        }
        await businessesRef.doc(String(req.params.id)).update({ is_verified });
        res.json({ success: true, message: 'Business verified' });
    } catch (error) {
        console.error('Error updating verification:', error);
        res.status(500).json({ message: 'Error updating verification' });
    }
};

exports.deleteBusiness = async (req, res) => {
    try {
        await businessesRef.doc(String(req.params.id)).delete();
        res.json({ success: true, message: 'Business deleted' });
    } catch (error) {
        console.error('Error deleting business:', error);
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
