import api from './api';

const notificationApi = {
    getNotifications: async (limit = 50) => {
        const response = await api.get(`/notifications?limit=${limit}`);
        return response.data.data;
    },
    getUnreadCount: async () => {
        const response = await api.get('/notifications/unread-count');
        return response.data.data.unread;
    },
    markRead: async (id = null) => {
        const payload = id ? { id } : {};
        const response = await api.post('/notifications/read', payload);
        return response.data;
    }
};

export default notificationApi;
