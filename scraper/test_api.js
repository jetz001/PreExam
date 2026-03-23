const axios = require('axios');

async function testApi(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://job.ocsc.go.th/',
                'Accept': 'application/json'
            },
            timeout: 5000
        });
        console.log("Success! Data keys:", Object.keys(response.data));
        console.log(JSON.stringify(response.data, null, 2));

    } catch (e) {
        console.error("Failed:", e.message);
        if (e.response) console.log("Status:", e.response.status);
    }
}

// Trying potential API endpoints
testApi('https://job.ocsc.go.th/api/jobs/10328');
