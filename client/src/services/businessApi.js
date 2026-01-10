import axios from 'axios';
import authService from './authService';

const BASE_URL = 'http://localhost:3000/api/business';

// Helper to get auth header (if not using global interceptor, which authService likely handles or we do manually)
// Assuming authService doesn't auto-inject into axios global, but maybe it does. 
// Existing code uses `adsApi.js`. Let's assume standard axios or helper.
// I will reuse `authService.getToken()` if available or rely on interceptors.
// Checking `authService.jsx` (Step 87) implies logic is inside `authService`. It doesn't show axios setup.
// I'll assume I need to attach token manually or use an axios instance if one exists.
// Let's create a local instance with interceptor to be safe.

const api = axios.create({
    baseURL: BASE_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/auth/business/login')) {
                window.location.href = '/auth/business/login';
            }
        }
        return Promise.reject(error);
    }
);

const businessApi = {
    // Business Profile
    getMyBusiness: async () => {
        const response = await api.get('/my-business');
        return response.data;
    },
    createBusiness: async (data) => {
        const response = await api.post('/', data);
        return response.data;
    },
    updateBusiness: async (data) => {
        // Handle FormData vs JSON
        let headers = {};
        if (data instanceof FormData) {
            headers['Content-Type'] = 'multipart/form-data';
        }
        const response = await api.put('/', data, { headers });
        return response.data;
    },
    getBusinessById: async (id) => {
        const response = await api.get(`/${id}`);
        return response.data;
    },
    getAllBusinesses: async (params) => {
        const response = await api.get('/', { params });
        return response.data;
    },

    // Posts
    createPost: async (postData) => {
        let headers = {};
        if (postData instanceof FormData) {
            headers['Content-Type'] = 'multipart/form-data';
        }
        const response = await api.post('/posts', postData, { headers });
        return response.data;
    },
    updatePost: async (id, postData) => {
        let headers = {};
        if (postData instanceof FormData) {
            headers['Content-Type'] = 'multipart/form-data';
        }
        const response = await api.put(`/posts/${id}`, postData, { headers });
        return response.data;
    },
    getPosts: async (params) => {
        const response = await api.get('/posts', { params });
        return response.data;
    },
    getPostDetail: async (id) => {
        const response = await api.get(`/posts/${id}`);
        return response.data;
    },
    toggleLike: async (post_id) => {
        const response = await api.post('/posts/like', { post_id });
        return response.data;
    },
    toggleBookmark: async (post_id) => {
        const response = await api.post('/posts/bookmark', { post_id });
        return response.data;
    },

    // Reviews
    createReview: async (data) => {
        const response = await api.post('/reviews', data);
        return response.data;
    },
    getReviews: async (business_id) => {
        const response = await api.get(`/${business_id}/reviews`);
        return response.data;
    },
    replyToReview: async (reviewId, reply) => {
        const response = await api.put(`/reviews/${reviewId}/reply`, { reply });
        return response.data;
    },

    // Follow
    followBusiness: async (business_id) => {
        const response = await api.post('/follow', { business_id });
        return response.data;
    },
    unfollowBusiness: async (business_id) => {
        const response = await api.post('/unfollow', { business_id });
        return response.data;
    },
    async getFollowingFeed() {
        const response = await api.get('/feed');
        return response.data;
    },

    async sendMessage(data) {
        const response = await api.post('/message', data);
        return response.data;
    },

    async getInbox() {
        const response = await api.get('/inbox');
        return response.data;
    },

    async getMessages(businessId, userId = null) {
        const params = userId ? { user_id: userId } : {};
        const response = await api.get(`/${businessId}/messages`, { params });
        return response.data;
    },

    getSystemSettings: async () => {
        const response = await api.get('/settings');
        return response.data;
    },

    submitVerification: async (formData) => {
        const response = await api.post('/verify', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};

export default businessApi;
