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
    }
};

export default roomService;
