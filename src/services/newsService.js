import api from './api';

const newsService = {
    getNews: async (category, search, agency, ministry) => {
        const params = {};
        if (category) params.category = category;
        if (search) params.search = search;
        if (agency) params.agency = agency;
        if (ministry) params.ministry = ministry;

        const response = await api.get('/news', { params });
        return response.data;
    },

    getAgencyStats: async () => {
        const response = await api.get('/news/agency-stats');
        return response.data;
    },

    getNewsById: async (id) => {
        const response = await api.get(`/news/${id}`);
        return response.data;
    },

    getOcscJob: async (ocscId) => {
        const response = await api.get(`/news/ocsc-job/${ocscId}`);
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
