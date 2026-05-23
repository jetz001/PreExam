import api from './api';

const communityService = {
    getThreads: async ({ pageParam, category, search } = {}) => {
        const response = await api.get('/community/threads', {
            params: {
                cursor: pageParam,
                category: category !== 'all' ? category : undefined,
                search
            },
        });
        return response.data;
    },

    getUserThreads: async (userId) => {
        const response = await api.get(`/community/threads/user/${userId}`);
        return response.data;
    },

    createThread: async (threadData) => {
        const token = localStorage.getItem('token');
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        
        const response = await fetch(`${baseUrl}/community/threads`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // Do NOT set Content-Type, browser will automatically set it with boundary for FormData
            },
            body: threadData
        });

        if (!response.ok) {
            let errorMsg = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.error || errorMsg;
            } catch (e) {
                // Ignore parse errors
            }
            throw new Error(errorMsg);
        }

        return await response.json();
    },

    shareNews: async ({ newsId, content }) => {
        const response = await api.post('/community/share-news', { newsId, content });
        return response.data;
    },

    shareBusinessPost: async ({ postId, content }) => {
        const response = await api.post('/community/share-post', { postId, content });
        return response.data;
    },

    likeThread: async (id) => {
        const response = await api.post(`/community/threads/${id}/like`);
        return response.data;
    },

    getTrendingTags: async () => {
        const response = await api.get('/community/tags/trending');
        return response.data;
    },

    getGroups: async () => {
        const response = await api.get('/groups');
        return response.data;
    },

    deleteThread: async (id) => {
        const response = await api.delete(`/community/threads/${id}`);
        return response.data;
    },

    reportContent: async (data) => {
        const response = await api.post('/reports/report', data);
        return response.data;
    }
};

export default communityService;
