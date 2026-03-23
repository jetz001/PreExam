const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const db = require('./models/db_manager');
const apiClient = require('./utils/api_client');
const axios = require('axios');
const { z } = require('zod');

puppeteer.use(StealthPlugin());

const JobSchema = z.object({
    title: z.string().min(5),
    content: z.string().min(20),
    category: z.string(),
    agency: z.string().optional(),
    metadata: z.record(z.any()).optional(),
    end_date: z.string().nullable().optional(),
    external_link: z.string().url(),
    pdf_url: z.string().optional(),
    keywords: z.string().optional(),
    source_memo: z.string()
});

class OCSCScraper {
    constructor() {
        const configPath = path.resolve(__dirname, 'config.yaml');
        this.config = yaml.load(fs.readFileSync(configPath, 'utf8'));
        this.isDryRun = process.argv.includes('--dry-run');
    }

    async init() {
        console.log('Starting OCSC Scraper...');
        await db.init();
        if (!this.isDryRun) await db.pruneOldRecords();
    }

    async run() {
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            // Intercept API
            const jobs = await this.fetchViaAPI(page);
            console.log(`Found ${jobs.length} jobs via API.`);

            let successCount = 0;
            let skipCount = 0;
            let errorCount = 0;

            for (const job of jobs) {
                try {
                    const isDup = await db.isDuplicate(job.link);
                    if (isDup) {
                        skipCount++;
                        continue;
                    }

                    const jobDetail = await this.processJob(job);

                    if (this.isDryRun) {
                        console.log(`[Dry-Run] Scraped: ${jobDetail.title}`);
                        successCount++;
                    } else {
                        await apiClient.postJob(jobDetail);
                        await db.saveJob(job.link, job.title, '');
                        successCount++;
                        console.log(`[Success] Posted: ${jobDetail.title}`);
                    }

                    // Random delay
                    await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));
                } catch (e) {
                    console.error(`Error processing job ${job.title}:`, e.message);
                    errorCount++;
                }
            }

            const summary = `OCSC Scraper Finished: Success=${successCount}, Skipped=${skipCount}, Errors=${errorCount}`;
            console.log(summary);
            if (!this.isDryRun) {
                await apiClient.sendSystemAlert(summary);
            }

        } catch (error) {
            console.error('Fatal Error:', error);
            if (!this.isDryRun) await apiClient.sendSystemAlert(`OCSC Scraper Fatal Error: ${error.message}`);
        } finally {
            if (browser) await browser.close();
            db.close();
            process.exit(0);
        }
    }

    async fetchViaAPI(page) {
        const apiBase = this.config.urls.api_base;
        const allJobs = [];
        const headers = {
            'referer': 'https://job.ocsc.go.th/',
            'origin': 'https://job.ocsc.go.th',
            'accept': 'application/json, text/plain, */*'
        };

        // Types: 1=Civil, 2=Gov Employee, 3=Other
        for (const type of [1, 2, 3]) {
            console.log(`Fetching departments for type ${type}...`);
            try {
                const deptRes = await axios.get(`${apiBase}/departments?type=${type}`, { headers });
                const depts = deptRes.data;
                console.log(`Found ${depts.length} departments for type ${type}.`);

                for (const dept of depts) {
                    try {
                        const jobRes = await axios.get(`${apiBase}/jobs?department=${encodeURIComponent(dept.department)}`, { headers });
                        const deptJobs = jobRes.data;

                        if (Array.isArray(deptJobs)) {
                            deptJobs.forEach(job => {
                                allJobs.push({
                                    title: `${job.position || 'ไม่ระบุตำแหน่ง'} - ${job.department || 'ไม่ระบุหน่วยงาน'}`,
                                    link: `https://job.ocsc.go.th/portal/jobs/${job.id}`,
                                    raw: job
                                });
                            });
                            console.log(`  Added ${deptJobs.length} jobs from ${dept.department}`);
                        }
                        // Small throttle
                        await new Promise(r => setTimeout(r, 200));
                    } catch (e) {
                        console.error(`  Error fetching jobs for ${dept.department || 'unknown'}:`, e.message);
                    }
                }
            } catch (e) {
                console.error(`Error fetching categories for type ${type}:`, e.message);
            }
        }

        console.log(`Total jobs found: ${allJobs.length}`);
        return allJobs;
    }

    async processJob(job) {
        const item = job.raw;
        const detailUrl = job.link;

        let metadata = {
            organization: item.department || '',
            supervising_agency: item.ministry || '',
            recruitment_type: item.positionGroup || '',
            method: item.selectionMethod || '',
            location: item.location || 'กรุงเทพมหานคร',
            salary: item.salaryRange || '',
            position_type: item.positionType || '',
            vacancy_count: item.vacancyCount || '',
            education_level: item.educationLevel || '',
            requirements: item.educationDetail || '',
            job_description: item.jobDescription || '',
            application_start: item.applicationStartPrint || item.applicationStart || '',
            application_end: item.applicationEndPrint || item.applicationEnd || '',
            announcement_url: item.fileName || '',
            website: item.url || '',
            agency_logo: ''
        };

        // Deep Scraping OCSC Detail Page
        try {
            const { JSDOM } = require('jsdom');
            const resp = await axios.get(detailUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
                timeout: 10000
            });
            const dom = new JSDOM(resp.data);
            const document = dom.window.document;

            // Extract Agency Logo
            const headerImg = document.querySelector('.job-detail-header img');
            if (headerImg) metadata.agency_logo = headerImg.src;

            // Mapping <h4> to Metadata (Enrich existing)
            const mappings = {
                'รับสมัคร': 'recruitment_type',
                'ตำแหน่ง': 'position_name',
                'จังหวัดที่บรรจุ': 'location',
                'เงินเดือน': 'salary',
                'ประเภท': 'position_type',
                'จำนวน': 'vacancy_count',
                'ระดับการศึกษา': 'education_level',
                'ลักษณะงานที่ปฏิบัติ': 'job_description',
                'ประกาศรับสมัคร': 'announcement_url',
                'เว็บไซต์': 'website'
            };

            const headers = document.querySelectorAll('h4');
            headers.forEach(h4 => {
                const headText = h4.textContent.trim();
                const field = mappings[headText];
                if (field) {
                    const nextEl = h4.nextElementSibling;
                    if (nextEl) {
                        let val = '';
                        if (nextEl.tagName === 'P') val = nextEl.textContent.trim();
                        else if (nextEl.tagName === 'UL') val = Array.from(nextEl.querySelectorAll('li')).map(li => li.textContent.trim()).join('\n');
                        else if (nextEl.querySelector('a')) val = nextEl.querySelector('a').href;

                        if (val) {
                            if (field === 'position_name') metadata.organization = val; // Overwrite if detail page is more accurate
                            else metadata[field] = val;
                        }
                    }
                }
            });

            // Parse application dates from detail page if available and better formatted
            const openDateH4 = Array.from(headers).find(h => h.textContent.includes('เปิดรับสมัคร'));
            if (openDateH4 && openDateH4.nextElementSibling) {
                const dateText = openDateH4.nextElementSibling.textContent.trim();
                const period = dateText.split('-');
                if (period.length === 2) {
                    metadata.application_start = period[0].trim();
                    metadata.application_end = period[1].trim();
                }
            }

        } catch (e) {
            console.warn(`    Deep scraping failed for ${detailUrl}: ${e.message}`);
        }

        const content = `
### รายละเอียดงาน
- **ตำแหน่ง:** ${item.position || metadata.position_name || 'ไม่ระบุ'}
- **หน่วยงาน:** ${metadata.organization || item.department || ''} ${metadata.supervising_agency || item.ministry || ''}
- **จำนวน:** ${metadata.vacancy_count || item.vacancyCount || 1}
- **เงินเดือน:** ${metadata.salary || item.salaryRange || 'ตามโครงสร้างหน่วยงาน'}
- **รับสมัคร:** ${metadata.application_start || 'ไม่ระบุ'} ถึง ${metadata.application_end || 'ไม่ระบุ'}

${metadata.job_description || item.jobDescription || 'โปรดตรวจสอบรายละเอียดเพิ่มเติมจากไฟล์ประกาศ'}

---
[📥 ดาวน์โหลดประกาศรับสมัครฉบับเต็ม](${metadata.announcement_url || item.fileName || job.link})
[🔗 ลิงก์สมัครงาน](${metadata.website || item.url || job.link})
        `.trim();

        const parseThaiDate = (dateStr) => {
            if (!dateStr) return null;
            const months = {
                'ม.ค.': '01', 'ก.พ.': '02', 'มี.ค.': '03', 'เม.ย.': '04',
                'พ.ค.': '05', 'มิ.ย.': '06', 'ก.ค.': '07', 'ส.ค.': '08',
                'ก.ย.': '09', 'ต.ค.': '10', 'พ.ย.': '11', 'ธ.ค.': '12'
            };
            const parts = dateStr.trim().split(/\s+/);
            if (parts.length === 3) {
                const day = parts[0].padStart(2, '0');
                const month = months[parts[1]] || '01';
                const year = parseInt(parts[2]) - 543;
                return `${year}-${month}-${day}`;
            }
            return null;
        };

        const payload = {
            title: job.title,
            content: content,
            category: 'งานราชการ',
            agency: item.department || item.ministry || 'ไม่ระบุหน่วยงาน',
            metadata: metadata,
            end_date: parseThaiDate(metadata.application_end),
            external_link: job.link,
            pdf_url: item.fileName || '',
            keywords: `งานราชการ, ${item.ministry || ''}, ${item.department || ''}, ${item.position || ''}`,
            source_memo: `OCSC Scraper Corrected ${new Date().toISOString()}`
        };

        return JobSchema.parse(payload);
    }
}

const scraper = new OCSCScraper();
scraper.init().then(() => scraper.run());
