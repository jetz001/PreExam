import api from './api';

const examService = {
    getQuestions: async (params) => {
        const response = await api.get('/questions', { params });
        return response.data;
    },

    getSubjects: async () => {
        const response = await api.get('/questions/subjects');
        return response.data;
    },

    getCategories: async () => {
        const response = await api.get('/questions/categories');
        return response.data;
    },

    getQuestionById: async (id) => {
        const response = await api.get(`/questions/${id}`);
        return response.data;
    },

    submitExam: async (examData) => {
        const response = await api.post('/exams/submit', examData);
        return response.data;
    },

    getHistory: async () => {
        const response = await api.get('/exams/history');
        return response.data;
    },

    getResultById: async (id) => {
        const response = await api.get(`/exams/${id}`);
        return response.data;
    },
};

export default examService;
