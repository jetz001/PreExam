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
        // threadData should be FormData given the image upload support
        const response = await api.post('/community/threads', threadData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
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
