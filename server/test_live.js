const axios = require('axios');

async function test() {
    try {
        const res = await axios.get('https://preexam.online/api/community/threads');
        console.log("Status:", res.status);
        console.log("Data:", res.data);
    } catch (err) {
        console.error("Error:", err.response ? err.response.status : err.message);
        if (err.response) console.error(err.response.data);
    }
}
test();
