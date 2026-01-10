import api from './api';

const studyGroupService = {
    getAllGroups: async (search) => {
        const response = await api.get('/groups', { params: { search } });
        return response.data;
    },

    getMyGroups: async () => {
        const response = await api.get('/groups/my-groups');
        return response.data;
    },

    createGroup: async (data) => {
        const response = await api.post('/groups', data);
        return response.data;
    },

    joinGroup: async (groupId, password = null) => {
        const response = await api.post(`/groups/${groupId}/join`, { password });
        return response.data;
    },

    getMessages: async (groupId) => {
        const response = await api.get(`/groups/${groupId}/messages`);
        return response.data;
    },

    sendMessage: async (groupId, message) => {
        const response = await api.post(`/groups/${groupId}/messages`, { message });
        return response.data;
    },

    deleteGroup: async (groupId) => {
        const response = await api.delete(`/groups/${groupId}`);
        return response.data;
    }
};

export default studyGroupService;
