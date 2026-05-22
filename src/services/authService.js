import api from './api';

const authService = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    login: async (userData) => {
        const response = await api.post('/auth/login', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token, newPassword) => {
        const response = await api.post('/auth/reset-password', { token, newPassword });
        return response.data;
    },

    googleLogin: async (token) => {
        const response = await api.post('/auth/google', { token });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    facebookLogin: async (accessToken, userID) => {
        const response = await api.post('/auth/facebook', { accessToken, userID });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    guestLogin: async () => {
        let deviceId = localStorage.getItem('guest_device_id');
        if (!deviceId) {
            // Generate a robust UUID if not exists
            // Generate a robust UUID if not exists. Fallback includes random hex to avoid 'guest-17' pattern.
            const randomHex = Math.random().toString(16).slice(2, 10); // 8 random hex chars
            deviceId = crypto.randomUUID ? crypto.randomUUID() : `guest-${Date.now()}-${randomHex}`;
            localStorage.setItem('guest_device_id', deviceId);
        }

        const response = await api.post('/auth/guest', { deviceId });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem('user'));
    },

    getToken: () => {
        return localStorage.getItem('token');
    },
};

export default authService;
