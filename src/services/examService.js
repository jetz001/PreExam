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

    getCategories: async (params) => {
        const response = await api.get('/questions/categories', { params });
        return response.data;
    },

    getExamYears: async () => {
        const response = await api.get('/questions/years');
        return response.data;
    },

    getExamSets: async () => {
        const response = await api.get('/questions/sets');
        return response.data;
    },

    getExamSetsMeta: async () => {
        const response = await api.get('/exam-sets');
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
        const response = await api.get(`/exams/history?_t=${Date.now()}`);
        return response.data;
    },

    getUserHistory: async (userId) => {
        const response = await api.get(`/users/${userId}/exams`);
        return response.data;
    },

    getResultById: async (id) => {
        const response = await api.get(`/exams/${id}`);
        return response.data;
    },

    // User Question Bank
    getUserQuestions: async () => {
        const response = await api.get('/user/questions');
        return response.data;
    },

    bulkCreateUserQuestions: async (data) => {
        const response = await api.post('/user/questions/bulk', data);
        return response.data;
    },

    deleteUserQuestion: async (id) => {
        const response = await api.delete(`/user/questions/${id}`);
        return response.data;
    },
};

export default examService;
