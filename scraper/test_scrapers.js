const axios = require('axios');
const { JSDOM } = require('jsdom');

async function testScrape(url) {
    console.log(`Testing URL: ${url}`);
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
            timeout: 5000
        });
        const html = response.data;

        // Logic from newsController.js
        const isOCSC = url.includes('job.ocsc.go.th/portal/jobs/');
        if (!isOCSC) {
            console.log("Not an OCSC URL");
            return;
        }

        const dom = new JSDOM(html);
        const document = dom.window.document;

        // Extract Agency Logo
        const headerImg = document.querySelector('.job-detail-header img');
        const agency_logo = headerImg ? headerImg.src : '';

        // Extract basic titles
        const ogTitle = document.querySelector('meta[property="og:title"]')?.content;
        console.log("OG Title Backup:", ogTitle);

        // Map data from Next.js hydration payload if available (fallback)
        let jsonData = {};
        const scriptTags = document.querySelectorAll('script');
        scriptTags.forEach(script => {
            if (script.textContent.includes('window.__INITIAL_STATE__') || script.textContent.includes('window.__NEXT_DATA__')) {
                console.log("Found embedded state script!");
            }
        });

        const nextData = document.getElementById('__NEXT_DATA__');
        if (nextData) {
            console.log("__NEXT_DATA__ block found via DOM query!");
            const d = JSON.parse(nextData.textContent);
            if (d.props && d.props.pageProps) {
                console.log("Keys in pageProps:", Object.keys(d.props.pageProps));
            }
        } else {
            console.log("No NEXT_DATA ID found.");
        }


    } catch (error) {
        console.error('Error:', error.message);
    }
}

testScrape('https://job.ocsc.go.th/portal/jobs/10328');
