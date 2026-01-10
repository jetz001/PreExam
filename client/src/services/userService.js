import api from './api';

const userService = {
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    getUserProfile: async (id) => {
        const response = await api.get(`/users/profile/${id}`);
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/users/stats');
        return response.data;
    },

    getHeatmapStats: async () => {
        const response = await api.get(`/users/stats/heatmap?_t=${Date.now()}`);
        return response.data;
    },

    getRadarStats: async () => {
        const response = await api.get(`/users/stats/radar?_t=${Date.now()}`);
        return response.data;
    },

    updateProfile: async (data) => {
        // If data contains file (avatar), we might need to send FormData or let the component handle it?
        // Usually api.js handles JSON. If FormData, Axios auto-detects.
        // But userService.updateProfile might receive FormData object if it's from file upload.
        // If data is just object, we surely send JSON.
        // Let's assume caller sends FormData if needed, or we check.
        const header = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
        const response = await api.put('/users/profile', data, { headers: header });
        return response.data;
    },

    updateSettings: async (data) => {
        const response = await api.put('/users/settings', data);
        return response.data;
    },

    searchUsers: async (query) => {
        const response = await api.get(`/users/search?q=${query}`);
        return response.data;
    },

    deleteAccount: async () => {
        const response = await api.delete('/users/profile');
        return response.data;
    },

    downgradeBusinessAccount: async () => {
        const response = await api.delete('/users/business-profile');
        return response.data;
    },
};

export default userService;
