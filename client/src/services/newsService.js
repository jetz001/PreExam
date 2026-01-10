import api from './api';

const newsService = {
    getNews: async (category, search) => {
        const params = {};
        if (category) params.category = category;
        if (search) params.search = search;

        const response = await api.get('/news', { params });
        return response.data;
    },

    getNewsById: async (id) => {
        const response = await api.get(`/news/${id}`);
        return response.data;
    },

    getPopularKeywords: async () => {
        const response = await api.get('/news/popular-keywords');
        return response.data;
    },

    // Method for admin usage later
    createNews: async (newsData) => {
        const response = await api.post('/news', newsData);
        return response.data;
    }
};

export default newsService;
