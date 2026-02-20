import api from './api';

const chatApi = {
    getInboxConversations: async () => {
        const response = await api.get('/chat/inbox/conversations');
        return response.data.data;
    },
    getMessages: async (friendId) => {
        const response = await api.get(`/chat/${friendId}`);
        return response.data.data;
    },
    sendMessage: async (friendId, message) => {
        const response = await api.post('/chat/send', { friendId, message });
        return response.data.data;
    },
    markRead: async (friendId) => {
        const response = await api.post('/chat/read', { friendId });
        return response.data;
    }
};

export default chatApi;
