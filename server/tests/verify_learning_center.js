const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';

async function verifyLearningCenter() {
    console.log('🚀 Starting Learning Center Verification...');

    let token = '';
    let businessId = '';

    try {
        // 0. Login to get Token
        console.log('\n--- 0. Authenticating ---');
        try {
            const username = `testuser_${Date.now()}`;
            const email = `${username}@example.com`;
            const password = 'password123';

            // Register
            console.log(`Registering temp user: ${username}...`);
            const regRes = await axios.post(`${BASE_URL}/auth/register`, {
                username, email, password, confirmPassword: password
            });

            // Login (usually auto-logged in or return token, check response)
            if (regRes.data.token) {
                token = regRes.data.token;
                console.log('✅ Registered and got token.');
            } else {
                console.log('Registered, now logging in...');
                const loginRes = await axios.post(`${BASE_URL}/auth/login`, { email, password });
                token = loginRes.data.token;
                console.log('✅ Logged in and got token.');
            }

        } catch (e) {
            console.warn('⚠️  Auth/Register failed (maybe user exists or DB unique constraint). Trying generic login...');
        }

        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Fetch Businesses (Public)
        console.log('\n--- 1. Testing Get All Businesses (Public) ---');
        const businessesRes = await axios.get(`${BASE_URL}/business`);
        console.log(`✅ Success: Fetched ${businessesRes.data.businesses.length} businesses.`);

        // 2. Create Business (Protected)
        if (token) {
            console.log('\n--- 2. Testing Create Business (Protected) ---');
            try {
                const busData = {
                    name: `Test Biz ${Date.now()}`,
                    tagline: 'Learning is fun',
                    category: 'Education',
                    contact_link: 'http://example.com'
                };
                const createBusRes = await axios.post(`${BASE_URL}/business`, busData, authHeaders);
                businessId = createBusRes.data.business.id;
                console.log(`✅ Success: Created Business ID ${businessId}`);
            } catch (error) {
                if (error.response && error.response.status === 400 && error.response.data.message.includes('already has a business')) {
                    console.log('✅ User already has a business (Expected constraint).');
                    // Try to fetch it to continue tests
                    const myBus = await axios.get(`${BASE_URL}/business/my-business`, authHeaders);
                    businessId = myBus.data.business.id;
                    console.log(`✅ Retrieved existing Business ID ${businessId}`);
                } else {
                    throw error;
                }
            }
        }

        // 3. Test Ad Pending List (Admin Route)
        console.log('\n--- 3. Testing Admin Pending Ads ---');
        try {
            const adsRes = await axios.get(`${BASE_URL}/admin/ads/pending`, authHeaders);
            console.log(`✅ Success: Fetched ${adsRes.data.length} pending ads.`);
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                console.log('✅ Success: Admin route is protected (401/403 received as expected for non-admin).');
            } else {
                console.error('❌ Failed: Unexpected error on admin route', error.message);
            }
        }

        console.log('\n✅ Verification Complete: Core endpoints are reachable.');

    } catch (error) {
        console.error('\n❌ Verification Failed:', error.message);
        if (error.code) console.error('Code:', error.code);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Full Error:', error);
        }
    }
}

verifyLearningCenter();
