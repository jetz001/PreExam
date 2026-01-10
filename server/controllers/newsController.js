const { News, NewsSource } = require('../models');

exports.getSources = async (req, res) => {
    try {
        const sources = await NewsSource.findAll({ order: [['id', 'DESC']] });
        res.json({ success: true, data: sources });
    } catch (error) {
        console.error('Error fetching sources:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createSource = async (req, res) => {
    try {
        const source = await NewsSource.create(req.body);
        res.status(201).json({ success: true, data: source });
    } catch (error) {
        console.error('Error creating source:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteSource = async (req, res) => {
    try {
        await NewsSource.destroy({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Source deleted' });
    } catch (error) {
        console.error('Error deleting source:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getNews = async (req, res) => {
    try {
        const { category, search } = req.query;
        const { Op } = require('sequelize');

        const whereClause = {};

        if (category) {
            whereClause.category = category;
        }

        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { summary: { [Op.like]: `%${search}%` } },
                { keywords: { [Op.like]: `%${search}%` } }
            ];
        }

        const news = await News.findAll({
            where: whereClause,
            order: [['published_at', 'DESC']],
        });
        res.json({ success: true, data: news });
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getNewsById = async (req, res) => {
    try {
        const news = await News.findByPk(req.params.id);
        if (!news) {
            return res.status(404).json({ success: false, message: 'News not found' });
        }
        // Increment views
        news.views += 1;
        await news.save();

        res.json({ success: true, data: news });
    } catch (error) {
        console.error('Error fetching news detail:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createNews = async (req, res) => {
    try {
        const news = await News.create(req.body);
        res.status(201).json({ success: true, data: news });
    } catch (error) {
        console.error('Error creating news:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateNews = async (req, res) => {
    try {
        const news = await News.findByPk(req.params.id);
        if (!news) {
            return res.status(404).json({ success: false, message: 'News not found' });
        }
        await news.update(req.body);
        res.json({ success: true, data: news });
    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteNews = async (req, res) => {
    try {
        const result = await News.destroy({ where: { id: req.params.id } });
        if (!result) {
            return res.status(404).json({ success: false, message: 'News not found' });
        }
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
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
            timeout: 5000
        });
        const html = response.data;

        // Simple Regex Helpers
        const getMetaContent = (prop) => {
            const regex = new RegExp(`<meta\\s+(?:property|name)=["']${prop}["']\\s+content=["'](.*?)["']`, 'i');
            const match = html.match(regex);
            return match ? match[1] : '';
        };

        const getTitle = () => {
            const ogTitle = getMetaContent('og:title');
            if (ogTitle) return ogTitle;
            const titleMatch = html.match(/<title>(.*?)<\/title>/i);
            return titleMatch ? titleMatch[1] : '';
        };

        const title = getTitle();
        const summary = getMetaContent('og:description') || getMetaContent('description');
        const image_url = getMetaContent('og:image');

        let keywords = getMetaContent('keywords') || getMetaContent('news_keywords');

        // Fallback: Generate keywords from Title & Summary if meta is empty
        if (!keywords && (title || summary)) {
            const text = `${title} ${summary}`;
            keywords = ''; // Initialize keywords for accumulation

            // 1. Pattern-Based Extraction (High Priority)
            // Extract text after "ตำแหน่ง" (Position)
            const positionMatch = text.match(/ตำแหน่ง\s*([ก-๙a-zA-Z0-9\.\-]+)/g);
            if (positionMatch) {
                positionMatch.forEach(m => {
                    const clean = m.replace('ตำแหน่ง', '').trim();
                    if (clean.length > 3) keywords += `, ${clean}`;
                });
            }

            // Extract Organization looking phrases (starts with Commission, Office, Department, Ministry)
            const orgPrefixes = ['สำนักงาน', 'กรม', 'กระทรวง', 'คณะ', 'โรงเรียน', 'มหาวิทยาลัย', 'อบต\\.', 'อบจ\\.', 'เทศบาล'];
            const orgRegex = new RegExp(`(${orgPrefixes.join('|')})[ก-๙a-zA-Z0-9\\.\\-]+`, 'g');
            const orgMatch = text.match(orgRegex);
            if (orgMatch) {
                orgMatch.forEach(m => {
                    if (m.length > 5) keywords += `, ${m}`;
                });
            }

            // 2. Tokenization Strategy (Fallback for general tags)
            let cleanText = text
                .replace(/["'()*+,-./:;<=>?@[\]^_`{|}~]/g, ' ')
                .replace(/\s+/g, ' ');

            const tokens = cleanText.split(/[\s,]+/);

            // 3. Stopwords
            const stopWords = [
                'และ', 'หรือ', 'ของ', 'ที่', 'ใน', 'การ', 'ความ', 'เป็น', 'ไม่', 'ให้', 'ได้', 'ไป', 'มา', 'เพื่อ', 'โดย',
                'ประกาศ', 'เรื่อง', 'ฉบับ', 'ว่าด้วย', 'หลักเกณฑ์', 'วิธีการ', 'เงื่อนไข', 'กำหนด', 'วัน', 'เวลา', 'สถานที่',
                'สอบ', 'ระเบียบ', 'เกี่ยวกับการ', 'รายชื่อ', 'ผู้มีสิทธิ', 'รายละเอียด', 'แนบท้าย', 'ดังนี้', 'สำนักงาน',
                'คณะกรรมการ', 'จังหวัด', 'อำเภอ', 'ตำบล', 'ประจำปี', 'พ.ศ.', 'รับสมัคร', 'ตำแหน่ง'
            ];

            const potentialKeywords = tokens
                .map(t => t.trim())
                .filter(t => {
                    if (t.length < 2) return false;
                    if (/^\d+$/.test(t)) return false;
                    if (stopWords.includes(t)) return false;
                    // Allow longer phrases now if they were not caught by logic above, but limit strictness
                    if (t.length > 50) return false;
                    return true;
                });

            // Add unique tokens
            keywords += ', ' + potentialKeywords.join(', ');

            // 4. Final Cleanup
            const finalSet = new Set(
                keywords
                    .split(',')
                    .map(k => k.trim())
                    .filter(k => k && k.length > 2)
            );
            // Limit to top 15 to allow for more variety
            keywords = [...finalSet].slice(0, 15).join(', ');
        }

        res.json({
            success: true,
            data: {
                title: title.replace(/&amp;/g, '&'), // Basic decode
                summary: summary ? summary.replace(/&amp;/g, '&') : '',
                image_url: image_url || '',
                keywords: keywords || ''
            }
        });

    } catch (error) {
        console.error('Error scraping metadata:', error.message);
        // Don't fail hard, just return empty so user can fill manually
        res.json({ success: false, message: 'Failed to autofill', data: {} });
    }
};

exports.getPopularKeywords = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        // Fetch news created in last 30 days
        const newsItems = await News.findAll({
            where: {
                published_at: {
                    [Op.gte]: oneMonthAgo
                }
            },
            attributes: ['keywords']
        });

        // Calculate frequency
        const frequency = {};
        newsItems.forEach(item => {
            if (item.keywords) {
                const tags = item.keywords.split(',').map(k => k.trim());
                tags.forEach(tag => {
                    if (tag && tag.length > 2) {
                        frequency[tag] = (frequency[tag] || 0) + 1;
                    }
                });
            }
        });

        // Sort by frequency and top 5 (User request)
        const sortedKeywords = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5) // Limit to top 5 as requested
            .map(entry => ({ name: entry[0], count: entry[1] }));

        res.json({ success: true, data: sortedKeywords });
    } catch (error) {
        console.error('Error fetching popular keywords:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getLandingPageNews = async (req, res) => {
    try {
        const { Op } = require('sequelize');

        // 1. Check for featured news modified within last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        let news = await News.findAll({
            where: {
                is_featured: true,
                // Logic: If manually featured, we check if it was featured/updated recently?
                // OR requirement: "If in 7 days no update... fallback"
                // Interpretation: If NO news has 'featured_at' > 7 days ago, then fallback.
            },
            order: [['featured_at', 'DESC']],
            limit: 5
        });

        // Check if we have valid manual selections
        // A valid selection is one that was "refreshed" or set within the last 7 days?
        // Or simply: If the Admin hasn't *touched* the featured list in 7 days.
        // Let's verify the most recent 'featured_at'.

        let useFallback = false;

        if (news.length === 0) {
            useFallback = true;
        } else {
            // Check the most recently featured item
            const latestFeature = news[0].featured_at;
            // If featured_at is null (legacy) or older than 7 days
            if (!latestFeature || new Date(latestFeature) < sevenDaysAgo) {
                useFallback = true;
            }
        }

        if (useFallback) {
            // Fallback: Top viewed news in last 30 days (or all time if low traffic)
            // Using all time for simplicity as "popular", or check published_at > 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            news = await News.findAll({
                where: {
                    published_at: { [Op.gte]: thirtyDaysAgo }
                },
                order: [['views', 'DESC'], ['published_at', 'DESC']],
                limit: 5
            });

            // If still empty (e.g. new site), just take latest
            if (news.length === 0) {
                news = await News.findAll({
                    order: [['published_at', 'DESC']],
                    limit: 5
                });
            }
        }

        res.json({ success: true, data: news, isFallback: useFallback });

    } catch (error) {
        console.error('Error fetching landing page news:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.toggleFeature = async (req, res) => {
    try {
        const news = await News.findByPk(req.params.id);
        if (!news) {
            return res.status(404).json({ success: false, message: 'News not found' });
        }

        const newStatus = !news.is_featured;

        // If turning ON, set featured_at to NOW
        // If turning OFF, maybe keep date or nullify? Let's keep date for history or nullify.
        // Better to update date only when turning ON so it counts as "update"

        await news.update({
            is_featured: newStatus,
            featured_at: newStatus ? new Date() : news.featured_at
        });

        res.json({ success: true, data: news });
    } catch (error) {
        console.error('Error toggling feature:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
