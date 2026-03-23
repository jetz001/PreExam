const axios = require('axios');

async function debugHtml(url) {
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
            timeout: 5000
        });
        const html = response.data;

        console.log("HTML Length:", html.length);

        const nextData = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
        if (nextData) {
            console.log("Found __NEXT_DATA__");
            const data = JSON.parse(nextData[1]);
            console.log("Data Keys:", Object.keys(data.props.pageProps || {}));
            console.log("Full JSON (First 500 chars):", JSON.stringify(data.props.pageProps).substring(0, 500));
        } else {
            console.log("__NEXT_DATA__ not found");
        }

    } catch (e) {
        console.error(e.message);
    }
}

debugHtml('https://job.ocsc.go.th/portal/jobs/10328');
