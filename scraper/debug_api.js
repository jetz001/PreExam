const axios = require('axios');

async function testApi() {
    const url = 'https://jobapp.ocsc.go.th/jobapi/portal/departments?type=1';
    try {
        const res = await axios.get(url, {
            headers: {
                'referer': 'https://job.ocsc.go.th/',
                'origin': 'https://job.ocsc.go.th',
                'accept': 'application/json, text/plain, */*'
            }
        });
        console.log('STATUS:', res.status);
        console.log('HEADERS:', res.headers);
        console.log('DATA (Snippet):', JSON.stringify(res.data).substring(0, 500));
    } catch (e) {
        console.error('FAILED:', e.message);
        if (e.response) {
            console.log('ERR STATUS:', e.response.status);
            console.log('ERR DATA:', e.response.data.toString().substring(0, 500));
        }
    }
}

testApi();
