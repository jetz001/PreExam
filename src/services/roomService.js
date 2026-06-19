import api from './api';

const roomService = {
    createRoom: async (data) => {
        const response = await api.post('/rooms', data);
        return response.data;
    },

    getRooms: async (page = 1, limit = 20) => {
        const response = await api.get(`/rooms?page=${page}&limit=${limit}`);
        return response.data;
    },

    joinRoom: async (code, password = null) => {
        const response = await api.post('/rooms/join', { code, password });
        return response.data;
    },

    getRoom: async (id) => {
        const response = await api.get(`/rooms/${id}`);
        return response.data;
    },

    startRoomExam: async (id) => {
        const response = await api.post(`/rooms/${id}/start`);
        return response.data;
    },

    finishRoomExam: async (id, data) => {
        const response = await api.post(`/rooms/${id}/finish`, data);
        return response.data;
    },

    submitRoomScore: async (id, data) => {
        const response = await api.post(`/rooms/${id}/score`, data);
        return response.data;
    },

    submitRoomProgress: async (id, data) => {
        const response = await api.post(`/rooms/${id}/progress`, data);
        return response.data;
    },

    setRoomNickname: async (id, data) => {
        const response = await api.post(`/rooms/${id}/nickname`, data);
        return response.data;
    },

    sendRoomMessage: async (id, data) => {
        const response = await api.post(`/rooms/${id}/chat`, data);
        return response.data;
    },

    tutorNavigate: async (id, data) => {
        const response = await api.post(`/rooms/${id}/tutor/navigate`, data);
        return response.data;
    },

    tutorReveal: async (id, data) => {
        const response = await api.post(`/rooms/${id}/tutor/reveal`, data);
        return response.data;
    },

    tutorAnswer: async (id, data) => {
        const response = await api.post(`/rooms/${id}/tutor/answer`, data);
        return response.data;
    },

    closeRoom: async (id) => {
        const response = await api.post(`/rooms/${id}/close`);
        return response.data;
    },

    resetRoomExam: async (id) => {
        const response = await api.post(`/rooms/${id}/reset`);
        return response.data;
    }
};

export default roomService;
