const axios = require('axios');

async function testIngestion() {
    try {
        console.log('Testing full ingestion flow to Backend...');

        const payload = {
            title: "ตำแหน่งนักวิชาการคอมพิวเตอร์ปฏิบัติการ - สำนักงานปลัดกระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม",
            content: "### รายละเอียดงาน\n- **ตำแหน่ง:** นักวิชาการคอมพิวเตอร์ปฏิบัติการ\n- **หน่วยงาน:** สำนักงานปลัดกระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม\n- **จำนวน:** 1 อัตรา\n- **รับสมัคร:** 01/03/2569 ถึง 15/03/2569",
            category: "งานราชการ",
            external_link: "https://job.ocsc.go.th/portal/job-office?jobId=10207",
            pdf_url: "https://job.ocsc.go.th/upload2/job-10207.pdf",
            keywords: "งานราชการ, สำนักงานปลัดกระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม, นักวิชาการคอมพิวเตอร์ปฏิบัติการ",
            source_memo: "Manual Integration Test " + new Date().toISOString()
        };

        const response = await axios.post('http://localhost:3000/api/news/scraper/ocsc', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Ingestion Status:', response.status);
        console.log('Result Data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('Ingestion Test Failed:', error.response?.data || error.message);
    }
}

testIngestion();
