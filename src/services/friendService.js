import api from './api';

const friendService = {
    sendRequest: async (friendId) => {
        const response = await api.post('/friends/request', { friendId });
        return response.data;
    },

    acceptRequest: async (friendId) => {
        const response = await api.post('/friends/accept', { friendId });
        return response.data;
    },

    removeFriend: async (friendId) => {
        const response = await api.delete(`/friends/remove/${friendId}`);
        return response.data;
    },

    getFriends: async () => {
        const response = await api.get('/friends/list');
        return response.data;
    },

    getPendingRequests: async () => {
        const response = await api.get('/friends/pending');
        return response.data;
    },

    checkStatus: async (userId) => {
        const response = await api.get(`/friends/check/${userId}`);
        return response.data;
    },

    searchUsers: async (query) => {
        const response = await api.get('/friends/search', { params: { query } });
        return response.data;
    }
};

export default friendService;
