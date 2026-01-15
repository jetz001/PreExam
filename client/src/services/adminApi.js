import api from './api';

const adminApi = {
    // Dashboard Overview
    getDashboardStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    // Question Manager
    getQuestions: async (filters) => {
        const response = await api.get('/questions', { params: { ...filters, orderBy: 'id' } });
        return response.data.data;
    },
    importQuestions: async (formData) => {
        const response = await api.post('/questions/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    createQuestion: async (data) => {
        const response = await api.post('/questions', data);
        return response.data;
    },
    updateQuestion: async (id, data) => {
        const response = await api.put(`/questions/${id}`, data);
        return response.data;
    },
    deleteQuestion: async (id) => {
        const response = await api.delete(`/questions/${id}`);
        return response.data;
    },

    // Payment Verification
    getPendingPayments: async () => {
        const response = await api.get('/admin/payments');
        return response.data.filter(p => p.status === 'pending');
    },
    getPaymentHistory: async () => {
        const response = await api.get('/admin/payments');
        return response.data.filter(p => p.status !== 'pending');
    },
    approvePayment: async (id, type) => {
        const response = await api.post(`/admin/payments/${id}/approve`, { type });
        return response.data;
    },
    rejectPayment: async (id, reason, type) => {
        const response = await api.post(`/admin/payments/${id}/reject`, { reason, type });
        return response.data;
    },

    // User Manager
    getUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },
    updateUserRole: async (id, role) => {
        const response = await api.put(`/admin/users/${id}`, { role });
        return response.data;
    },
    updateUserPermissions: async (id, permissions) => {
        const response = await api.put(`/admin/users/${id}/permissions`, { permissions });
        return response.data;
    },
    banUser: async (id) => {
        // Warning: banUser route might not exist in adminRoutes yet, assuming updateUser status
        const response = await api.put(`/admin/users/${id}`, { status: 'banned' });
        return response.data;
    },

    // News Manager
    getNews: async () => {
        const response = await api.get('/news');
        return response.data.data;
    },
    createNews: async (data) => {
        const response = await api.post('/news', data);
        return response.data;
    },
    deleteNews: async (id) => {
        const response = await api.delete(`/news/${id}`);
        return response.data;
    },
    scrapeWeb: async (url) => {
        const response = await api.post('/news/scrape', { url });
        return response.data.data;
    },
    // News Sources (Collection)
    getSources: async () => {
        const response = await api.get('/news/sources/all');
        return response.data.data;
    },
    createSource: async (data) => {
        const response = await api.post('/news/sources', data);
        return response.data;
    },
    deleteSource: async (id) => {
        const response = await api.delete(`/news/sources/${id}`);
        return response.data;
    },

    // Inbox & Reports
    // Inbox & Reports
    getMessages: async () => {
        const response = await api.get('/admin/messages');
        return response.data;
    },
    getReports: async () => {
        const response = await api.get('/admin/reports');
        return response.data;
    },

    // Settings & Assets
    getAssets: async () => {
        const response = await api.get('/assets');
        return response.data.data;
    },
    uploadAsset: async (formData) => {
        const response = await api.post('/assets', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Room Manager
    getActiveRooms: async () => {
        const response = await api.get('/rooms?limit=100');
        return response.data.data.map(room => ({
            id: room.id,
            name: room.name,
            mode: room.mode,
            participants: room.participant_count || 0
        }));
    },
    closeRoom: async (id) => {
        const response = await api.delete(`/rooms/${id}`);
        return response.data;
    },
    // Ad Management
    getPendingAds: async () => {
        const response = await api.get('/admin/ads/pending');
        return response.data;
    },
    approveAd: async (id) => {
        const response = await api.post(`/admin/ads/${id}/approve`);
        return response.data;
    },
    rejectAd: async (id) => {
        const response = await api.post(`/admin/ads/${id}/reject`);
        return response.data;
    },

    // System Settings
    getSystemSettings: async () => {
        const response = await api.get('/admin/settings');
        return response.data;
    },
    updateSystemSettings: async (settings) => {
        const response = await api.put('/admin/settings', settings);
        return response.data;
    },
    // Legal & Policy
    getPrivacyPolicy: async () => {
        const response = await api.get('/legal/policy');
        return response.data;
    },
    updatePrivacyPolicy: async (content) => {
        const response = await api.put('/legal/policy', { content });
        return response.data;
    },
    toggleNewsFeature: async (id) => {
        const response = await api.put(`/news/${id}/feature`);
        return response.data;
    }
};

export default adminApi;
