const axios = require('axios');
require('dotenv').config();

class APIClient {
    constructor() {
        this.apiUrl = process.env.BACKEND_API_URL || 'http://localhost:3000/api/scraper';
        this.apiKey = process.env.SCRAPER_API_KEY || 'dev_scraper_key';
    }

    async postJob(jobData) {
        try {
            const response = await axios.post(`${this.apiUrl}/jobs`, jobData, {
                headers: {
                    'x-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`API Post error for ${jobData.title}:`, error.response?.data || error.message);
            throw error;
        }
    }

    async sendSystemAlert(message) {
        try {
            await axios.post(`${this.apiUrl}/alert`, {
                message: message,
                type: 'system'
            }, {
                headers: {
                    'x-api-key': this.apiKey
                }
            });
        } catch (error) {
            console.error('Failed to send system alert:', error.message);
        }
    }
}

module.exports = new APIClient();
