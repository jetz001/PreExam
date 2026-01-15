const http = require('http');

const subject = encodeURIComponent('ท้องถิ่น ภาค ก');
const category = encodeURIComponent('ภาษาอังกฤษ');
const path = `/api/questions?subject=${subject}&category=${category}`;

console.log('Requesting:', path);

const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.data && json.data.rows) {
                console.log('Count:', json.data.rows.length);
            } else {
                console.log('Response structure unexpected:', Object.keys(json));
                console.log(JSON.stringify(json).substring(0, 200));
            }
        } catch (e) {
            console.log('Body:', data.substring(0, 200));
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
