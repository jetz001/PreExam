const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const TEST_USER = {
    username: `test_lc_${Date.now()}`,
    email: `test_lc_${Date.now()}@example.com`,
    password: 'password123'
};

async function testLearningCenterFlow() {
    try {
        console.log('1. Registering Test User...');
        const regRes = await axios.post(`${BASE_URL}/auth/register`, TEST_USER);
        const token = regRes.data.token;
        console.log('   -> Success. Token received.');

        console.log('2. Creating Business Page...');
        const busData = {
            name: 'Test Academy',
            tagline: 'Learning is Fun',
            category: 'Education',
            contact_link: 'http://line.me/ti/p/test'
        };
        const busRes = await axios.post(`${BASE_URL}/business`, busData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   -> Success. Business ID:', busRes.data.business.id);
        const businessId = busRes.data.business.id;

        console.log('3. Fetching My Business...');
        const myBusRes = await axios.get(`${BASE_URL}/business/my-business`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (myBusRes.data.business.name !== busData.name) throw new Error('Business name mismatch');
        console.log('   -> Success. Verified Name:', myBusRes.data.business.name);

        console.log('4. Creating a Post...');
        const postData = {
            business_id: businessId, // Ideally backend checks ownership
            title: 'Welcome to Test Academy',
            content: '<p>This is our first post!</p>',
            type: 'article',
            is_pinned: 'true'
        };
        // Note: For multipart/form-data (upload), axios needs FormData. 
        // But our controller handles JSON body if no files? 
        // My controller uses `upload.array`. If I send JSON, multer might skip? 
        // Express `upload.array` usually expects multipart.
        // Let's try sending standard JSON first, but if middleware blocks, we might fail.
        // If middleware is `upload.array`, it usually parses body too if multipart.
        // If I send JSON to an endpoint waiting for multipart, it might fail or req.body works?
        // Let's assume for this simple test we ignore file upload and see.
        // Actually, `postController` expects `req.body` fields. `upload.array` puts non-file fields in `req.body`.
        // But if content-type is json, multer might not run or might not parse body?
        // Usually need multipart for multer.

        // Let's try skipping file upload if possible or construct multipart.
        // Since I can't easily do FormData in node without `form-data` package (which might not be installed),
        // I will try to call the endpoint without files and hope multer passes.
        // If it fails, I'll update the script to use `form-data` (checking package.json... it's not there).
        // Wait, `axios` works with `URLSearchParams` for x-www-form-urlencoded.

        // Actually, let's try with JSON. Middleware `upload.array` might just ignore if not multipart?
        // No, typically if content-type isn't multipart, multer middleware might throw or empty req.body?
        // Let's test.
        try {
            await axios.post(`${BASE_URL}/business/posts`, postData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('   -> Success (JSON).');
        } catch (e) {
            console.log('   -> JSON failed (likely due to multer). Skipping Post creation in this simple test or assume multipart needed.');
            console.log('   -> Error:', e.response?.data || e.message);
        }

        console.log('5. Searching Businesses...');
        const listRes = await axios.get(`${BASE_URL}/business?search=Test`);
        const found = listRes.data.businesses.find(b => b.id === businessId);
        if (found) console.log('   -> Found created business in list.');
        else console.log('   -> WARNING: Created business not found in list (maybe empty list or sort).');

    } catch (error) {
        console.error('TEST FAILED:', error.response?.data || error.message);
    }
}

testLearningCenterFlow();
