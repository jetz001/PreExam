const { db: firestore } = require('../config/firebase');
const { logActivity } = require('../utils/activityLogger');

const newsRef = firestore.collection('news');
const sourcesRef = firestore.collection('news_sources');

exports.getSources = async (req, res) => {
    try {
        const snapshot = await sourcesRef.orderBy('created_at', 'desc').get();
        const sources = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ success: true, data: sources });
    } catch (error) {
        console.error('Error fetching sources:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createSource = async (req, res) => {
    try {
        const newRef = sourcesRef.doc();
        const data = {
            ...req.body,
            id: newRef.id,
            created_at: new Date().toISOString()
        };
        await newRef.set(data);
        res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('Error creating source:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteSource = async (req, res) => {
    try {
        await sourcesRef.doc(req.params.id).delete();
        res.json({ success: true, message: 'Source deleted' });
    } catch (error) {
        console.error('Error deleting source:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getNews = async (req, res) => {
    try {
        const { category, agency, search } = req.query;
        let query = newsRef;

        if (category) query = query.where('category', '==', category);
        if (agency) query = query.where('agency', '==', agency);

        const snapshot = await query.orderBy('published_at', 'desc').get();
        let newsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const today = new Date().toISOString().split('T')[0];
        
        // Manual filter for search and date due to Firestore limitations
        newsList = newsList.filter(news => {
            const isValidDate = !news.end_date || news.end_date >= today;
            if (!isValidDate) return false;

            if (search) {
                const lowerSearch = search.toLowerCase();
                const matchTitle = news.title && news.title.toLowerCase().includes(lowerSearch);
                const matchSummary = news.summary && news.summary.toLowerCase().includes(lowerSearch);
                const matchKeywords = news.keywords && news.keywords.toLowerCase().includes(lowerSearch);
                return matchTitle || matchSummary || matchKeywords;
            }
            return true;
        });

        res.json({ success: true, data: newsList });
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getAgencyStats = async (req, res) => {
    try {
        const snapshot = await newsRef.get();
        const newsList = snapshot.docs.map(doc => doc.data());
        const today = new Date().toISOString().split('T')[0];

        const statsMap = {};
        
        newsList.forEach(news => {
            if (news.agency && (!news.end_date || news.end_date >= today)) {
                if (!statsMap[news.agency]) {
                    statsMap[news.agency] = {
                        agency: news.agency,
                        count: 0,
                        latest_published: news.published_at,
                        agency_logo: news.metadata ? news.metadata.agency_logo : null
                    };
                }
                statsMap[news.agency].count += 1;
                if (news.published_at > statsMap[news.agency].latest_published) {
                    statsMap[news.agency].latest_published = news.published_at;
                }
            }
        });

        const statsArray = Object.values(statsMap).sort((a, b) => b.count - a.count);
        res.json({ success: true, data: statsArray });
    } catch (error) {
        console.error('Error fetching agency stats:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getNewsById = async (req, res) => {
    try {
        const doc = await newsRef.doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ success: false, message: 'News not found' });
        
        const news = doc.data();
        await doc.ref.update({ views: (news.views || 0) + 1 });
        
        await logActivity(req, 'BTN_READ_NEWS', { newsId: doc.id, title: news.title });

        res.json({ success: true, data: { ...news, id: doc.id, views: (news.views || 0) + 1 } });
    } catch (error) {
        console.error('Error fetching news detail:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createNews = async (req, res) => {
    try {
        const newRef = newsRef.doc();
        const data = {
            ...req.body,
            id: newRef.id,
            views: 0,
            published_at: req.body.published_at || new Date().toISOString(),
            created_at: new Date().toISOString()
        };
        await newRef.set(data);
        res.status(201).json({ success: true, data });
    } catch (error) {
        console.error('Error creating news:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateNews = async (req, res) => {
    try {
        const docRef = newsRef.doc(req.params.id);
        const doc = await docRef.get();
        if (!doc.exists) return res.status(404).json({ success: false, message: 'News not found' });
        
        await docRef.update(req.body);
        const updated = await docRef.get();
        res.json({ success: true, data: { id: updated.id, ...updated.data() } });
    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteNews = async (req, res) => {
    try {
        await newsRef.doc(req.params.id).delete();
        res.json({ success: true, message: 'News deleted' });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.scrapeMetadata = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ success: false, message: 'URL is required' });

        const axios = require('axios');
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 5000
        });
        const html = response.data;
        const isOCSC = url.includes('job.ocsc.go.th');
        let metadata = {};

        if (isOCSC) {
            let agencyName = '';
            let agency_logo = '';
            const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
            if (nextDataMatch) {
                try {
                    const d = JSON.parse(nextDataMatch[1]);
                    const jobData = d.props?.pageProps?.job || {};
                    agencyName = jobData.department || '';
                    metadata.recruitment_type = jobData.positionGroup || '';
                    metadata.salary = jobData.salaryRange || '';
                    metadata.position = jobData.position || '';
                    metadata.location = jobData.location || '';
                } catch (e) {}
            }
            res.json({
                success: true,
                data: {
                    title: `${metadata.position || ''} - ${agencyName}`,
                    summary: '',
                    image_url: agency_logo,
                    agency: agencyName,
                    metadata: { organization: agencyName, agency_logo, ...metadata }
                }
            });
            return;
        }

        res.json({ success: true, data: { title: 'Extracted Title', summary: '', image_url: '' } });
    } catch (error) {
        res.json({ success: false, message: 'Failed to autofill', data: {} });
    }
};

exports.getPopularKeywords = async (req, res) => {
    try {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const snapshot = await newsRef.where('published_at', '>=', oneMonthAgo.toISOString()).get();
        const frequency = {};

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.keywords) {
                const tags = data.keywords.split(',').map(k => k.trim());
                tags.forEach(tag => {
                    if (tag && tag.length > 2) {
                        frequency[tag] = (frequency[tag] || 0) + 1;
                    }
                });
            }
        });

        const sortedKeywords = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(entry => ({ name: entry[0], count: entry[1] }));

        res.json({ success: true, data: sortedKeywords });
    } catch (error) {
        console.error('Error fetching popular keywords:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getLandingPageNews = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        let snapshot = await newsRef.where('is_featured', '==', true)
                                    .orderBy('featured_at', 'desc')
                                    .limit(5)
                                    .get();
        
        let newsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        let useFallback = false;

        if (newsList.length === 0 || !newsList[0].featured_at || new Date(newsList[0].featured_at) < sevenDaysAgo) {
            useFallback = true;
            
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            snapshot = await newsRef.where('published_at', '>=', thirtyDaysAgo.toISOString())
                                    .orderBy('published_at', 'desc')
                                    .get();
            
            newsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                                    .sort((a, b) => (b.views || 0) - (a.views || 0))
                                    .slice(0, 5);

            if (newsList.length === 0) {
                snapshot = await newsRef.orderBy('published_at', 'desc').limit(5).get();
                newsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
        }

        logActivity(req, 'VIEW_LANDING', { isFallback: useFallback }).catch(err => console.error(err));
        res.json({ success: true, data: newsList, isFallback: useFallback });
    } catch (error) {
        console.error('Error fetching landing page news:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.toggleFeature = async (req, res) => {
    try {
        const docRef = newsRef.doc(req.params.id);
        const doc = await docRef.get();
        if (!doc.exists) return res.status(404).json({ success: false, message: 'News not found' });
        
        const newStatus = !doc.data().is_featured;
        await docRef.update({
            is_featured: newStatus,
            featured_at: newStatus ? new Date().toISOString() : doc.data().featured_at
        });

        res.json({ success: true, data: { ...doc.data(), is_featured: newStatus } });
    } catch (error) {
        console.error('Error toggling feature:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
