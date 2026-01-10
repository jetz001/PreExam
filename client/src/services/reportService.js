import api from './api';

const reportService = {
    submitReport: async (questionId, reason) => {
        const response = await api.post('/reports', { question_id: questionId, reason });
        return response.data;
    },
};

export default reportService;
