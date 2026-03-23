const axios = require('axios');

async function runTest() {
    const headers = {
        "Content-Type": "application/json",
        "X-API-KEY": "your-fallback-secret-key"
    };
    
    try {
        console.log("Testing POST /api/generator/exam...");
        const res1 = await axios.post('http://localhost:3000/api/generator/exam', {
            question_text: "e-Commerce เป็นเรื่องเดียวกับข้อใด",
            option_a: "การทำการค้าผ่านอินเทอร์เน็ต",
            option_b: "ระบบบัญชีอิเล็กทรอนิกส์",
            option_c: "การทำธุรกรรมภาครัฐ",
            option_d: "การสื่อสารผ่านอีเมล",
            correct_answer: "Option A",
            explanation: "e-Commerce คือพาณิชย์อิเล็กทรอนิกส์",
            subject: "ความรู้ทั่วไป",
            skill: "ความรู้ทั่วไป",
            catalogs: "วิชาความสามารถทั่วไป",
            exam_set: "Mockup ความรู้ทั่วไป"
        }, { headers });
        console.log("Exam Response:", res1.data);
        
        console.log("Testing POST /api/generator/inbox...");
        const res2 = await axios.post('http://localhost:3000/api/generator/inbox', {
            message: "Mock Data Creation Successful from test_api.js"
        }, { headers });
        console.log("Inbox Response:", res2.data);
    } catch (e) {
        if (e.response) {
            console.error("Test failed with status:", e.response.status, "data:", e.response.data);
        } else {
            console.error("Test failed, no response:", e);
        }
    }
}

runTest();
