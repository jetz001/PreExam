
import api from './api';

const publicService = {
    getStats: async () => {
        const response = await api.get('/public/stats');
        return response.data;
    },
    getLandingNews: async () => {
        const response = await api.get('/news/landing');
        return response.data;
    },
    async getSystemSettings() {
        const response = await api.get('/public/settings');
        return response.data;
    },
    async logActivity(action, details = {}) {
        try {
            await api.post('/public/log', { action, details });
        } catch (error) {
            console.error('Log Error:', error);
        }
    }
};

export default publicService;
