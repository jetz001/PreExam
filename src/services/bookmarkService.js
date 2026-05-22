import api from './api';

const bookmarkService = {
    getBookmarks: async () => {
        const response = await api.get('/bookmarks');
        return response.data;
    },

    addBookmark: async (data) => {
        const response = await api.post('/bookmarks', data);
        return response.data;
    },

    removeBookmark: async (id) => {
        const response = await api.delete(`/bookmarks/${id}`);
        return response.data;
    }
};

export default bookmarkService;
