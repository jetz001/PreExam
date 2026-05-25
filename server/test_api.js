const axios = require('axios');

async function test() {
    try {
        const res = await axios.get('http://localhost:3000/api/community/threads');
        console.log("Threads length:", res.data.threads.length);
        console.log("Threads:", res.data.threads.map(t => t.title));
    } catch (err) {
        console.error(err.message);
    }
}
test();
