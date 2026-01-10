const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function verifyRegistrationFix() {
    console.log('🚀 Verifying Registration Auto-Create Business Fix...');

    const timestamp = Date.now();
    const newUser = {
        display_name: `Test Sponsor ${timestamp}`,
        email: `sponsor_${timestamp}@test.com`,
        password: 'password123',
        confirmPassword: 'password123',
        role: 'sponsor',
        business_name: `Auto Biz ${timestamp}`,
        tax_id: '123456789'
    };

    try {
        console.log(`\n1. Registering new sponsor: ${newUser.email}`);
        const regRes = await axios.post(`${BASE_URL}/auth/register`, newUser);

        if (regRes.status === 201) {
            console.log('✅ Registration successful.');
            const token = regRes.data.token;
            console.log(`   Token received: ${token.substring(0, 15)}...`);

            console.log('\n2. Checking if Business Page specified was created...');
            try {
                const bizRes = await axios.get(`${BASE_URL}/business/my-business`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (bizRes.status === 200) {
                    console.log('✅ SUCCESS: Business Page found!');
                    console.log('   Business Name:', bizRes.data.business.name);
                    console.log('   Status:', bizRes.data.business.status);
                    if (bizRes.data.business.name === newUser.business_name) {
                        console.log('✅ Name matches requested business name.');
                    } else {
                        console.warn('⚠️  Name mismatch:', bizRes.data.business.name);
                    }
                }
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    console.error('❌ FAILURE: Business Page NOT found (404). Auto-create failed.');
                } else {
                    console.error('❌ Error fetching business:', err.message);
                }
            }

        } else {
            console.error('❌ Registration failed:', regRes.data);
        }

    } catch (error) {
        console.error('❌ Script Error:', error.response?.data || error.message);
    }
}

verifyRegistrationFix();
