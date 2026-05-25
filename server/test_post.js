const axios = require('axios');

async function testPost() {
  try {
    const res = await axios.post('https://preexam.online/api/community/threads', {
      title: "Test Post",
      content: "This is a test post.",
      category: "general"
    }, {
      // no auth token! It should return 401 Unauthorized immediately.
    });
    console.log("Status:", res.status);
    console.log("Data:", res.data);
  } catch (err) {
    console.error("Error Status:", err.response ? err.response.status : err.message);
    if (err.response) {
      console.error("Error Data:", err.response.data);
    }
  }
}

testPost();
