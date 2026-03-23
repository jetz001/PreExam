const { News, NewsSource } = require('../models');
const { logActivity } = require('../utils/activityLogger');

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

        const { agency } = req.query;
        if (agency) {
            whereClause.agency = agency;
        }

        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { summary: { [Op.like]: `%${search}%` } },
                { keywords: { [Op.like]: `%${search}%` } }
            ];
        }

        const today = new Date().toISOString().split('T')[0];
        whereClause[Op.or] = [
            { end_date: { [Op.gte]: today } },
            { end_date: null }
        ];

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

exports.getAgencyStats = async (req, res) => {
    try {
        const { sequelize } = require('../models');
        const stats = await News.findAll({
            attributes: [
                'agency',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('MAX', sequelize.col('published_at')), 'latest_published'],
                [sequelize.literal(`json_extract(metadata, '$.agency_logo')`), 'agency_logo']
            ],
            where: {
                agency: { [require('sequelize').Op.ne]: null },
                [require('sequelize').Op.or]: [
                    { end_date: { [require('sequelize').Op.gte]: new Date().toISOString().split('T')[0] } },
                    { end_date: null }
                ]
            },
            group: ['agency'],
            order: [[sequelize.col('count'), 'DESC']]
        });
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error fetching agency stats:', error);
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

        // Log Activity
        await logActivity(req, 'BTN_READ_NEWS', { newsId: news.id, title: news.title });

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

        const isOCSC = url.includes('job.ocsc.go.th/portal/jobs/');
        let metadata = {};

        if (isOCSC) {
            let agencyName = '';
            let supervisingAgency = '';
            let agency_logo = '';

            // Try to extract from __NEXT_DATA__ json first
            const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
            if (nextDataMatch) {
                try {
                    const d = JSON.parse(nextDataMatch[1]);
                    const jobData = d.props?.pageProps?.job || {};

                    agencyName = jobData.department || '';
                    supervisingAgency = jobData.ministry || '';
                    metadata.recruitment_type = jobData.positionGroup || '';
                    metadata.salary = jobData.salaryRange || '';
                    metadata.vacancy_count = jobData.vacancyCount || '';
                    metadata.education_level = jobData.educationLevel || '';
                    metadata.position = jobData.position || '';
                    metadata.location = jobData.location || '';
                    metadata.position_type = jobData.positionType || '';
                    metadata.job_description = jobData.jobDescription || '';
                    metadata.selection_method = jobData.selectionMethod || '';
                    metadata.announcement_url = jobData.fileName || '';
                    metadata.website = jobData.url || '';

                    if (jobData.applicationStartPrint) {
                        metadata.application_start = jobData.applicationStartPrint;
                        metadata.application_end = jobData.applicationEndPrint || '';
                    }
                } catch (e) {
                    console.error("Failed parsing NEXT_DATA:", e);
                }
            } else {
                // Try parsing raw HTML fallback using jsdom
                const { JSDOM } = require('jsdom');
                const dom = new JSDOM(html);
                const document = dom.window.document;

                const headerImg = document.querySelector('.job-detail-header img');
                agency_logo = headerImg ? headerImg.src : '';

                agencyName = document.querySelector('#department-link h2')?.textContent?.trim() || '';
                supervisingAgency = document.querySelector('.job-detail-header span')?.textContent?.trim() || '';

                const mappings = {
                    'รับสมัคร': 'recruitment_type',
                    'ตำแหน่ง': 'position',
                    'จังหวัดที่บรรจุ': 'location',
                    'เงินเดือน': 'salary',
                    'ประเภท': 'position_type',
                    'จำนวน': 'vacancy_count',
                    'ระดับการศึกษา': 'education_level',
                    'ลักษณะงานที่ปฏิบัติ': 'job_description',
                    'วิธีการเลือกสรร': 'selection_method',
                    'เกณฑ์การประเมิน': 'evaluation_criteria',
                    'เปิดรับสมัคร': 'application_period',
                    'ประกาศรับสมัคร': 'announcement_url',
                    'เว็บไซต์': 'website'
                };

                const headers = document.querySelectorAll('h4');
                headers.forEach(h4 => {
                    const headText = h4.textContent.trim();
                    const field = mappings[headText];

                    if (field) {
                        let value = '';
                        const nextEl = h4.nextElementSibling;
                        if (!nextEl) return;

                        if (nextEl.tagName === 'P') value = nextEl.textContent.trim();
                        else if (nextEl.tagName === 'UL') value = Array.from(nextEl.querySelectorAll('li')).map(li => li.textContent.trim()).join('\n');
                        else if (nextEl.tagName === 'A') value = nextEl.href;
                        else if (nextEl.querySelector('a')) value = nextEl.querySelector('a').href;
                        else if (nextEl.classList.contains('flex') || nextEl.tagName === 'DIV') value = nextEl.textContent.trim();

                        if (value) metadata[field] = value;
                    }
                });

                if (!metadata.job_description) {
                    const contentDivs = document.querySelectorAll('.content');
                    let fullText = '';
                    contentDivs.forEach(div => fullText += div.textContent + '\n');
                    if (fullText) metadata.job_description = fullText.substring(0, 1000);
                }

                if (!metadata.announcement_url) {
                    const pdfLink = Array.from(headers).find(h => h.textContent.includes("ประกาศรับสมัคร"))?.nextElementSibling?.querySelector('a')?.href;
                    if (pdfLink) metadata.announcement_url = pdfLink;
                }

                if (metadata.application_period) {
                    const period = metadata.application_period.split('-');
                    if (period.length === 2) {
                        metadata.application_start = period[0].trim();
                        metadata.application_end = period[1].trim();
                    }
                }
            }

            res.json({
                success: true,
                data: {
                    title: `${metadata.position || title} - ${agencyName}`,
                    summary: summary || metadata.job_description?.substring(0, 200),
                    image_url: image_url || agency_logo,
                    keywords: keywords || `งานราชการ, ${agencyName}, ${metadata.position || ''}`,
                    agency: agencyName,
                    metadata: {
                        organization: agencyName,
                        supervising_agency: supervisingAgency,
                        agency_logo: agency_logo,
                        ...metadata
                    }
                }
            });
            return;
        }

        res.json({
            success: true,
            data: {
                title: title.replace(/&amp;/g, '&'),
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

        // Log Landing Page Visit (ignoring errors to prevent blocking)
        logActivity(req, 'VIEW_LANDING', { isFallback: useFallback }).catch(err => console.error('Log Error:', err));

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
