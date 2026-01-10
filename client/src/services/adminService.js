import api from './api';

const adminService = {
    createQuestion: async (data) => {
        const response = await api.post('/questions', data);
        return response.data;
    },

    bulkCreateQuestions: async (data) => {
        const response = await api.post('/questions/bulk', data);
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

    createNews: async (data) => {
        const response = await api.post('/news', data);
        return response.data;
    },

    deleteNews: async (id) => {
        const response = await api.delete(`/news/${id}`);
        return response.data;
    },
};

export default adminService;
