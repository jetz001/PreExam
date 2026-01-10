import api from './api';

const adsApi = {
    // --- Sponsor Actions ---
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.post('/ads/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data; // { success: true, imageUrl: ... }
    },
    createAd: async (adData) => {
        const response = await api.post('/ads/create', adData);
        return response.data;
    },
    getMyAds: async () => {
        const response = await api.get('/ads/my-ads');
        return response.data;
    },
    updateAd: async (id, adData) => {
        const response = await api.put(`/ads/${id}`, adData);
        return response.data;
    },
    updateAdStatus: async (id, status) => {
        const response = await api.patch(`/ads/${id}/status`, { status });
        return response.data;
    },
    getWalletBalance: async () => {
        const response = await api.get('/ads/wallet');
        return response.data;
    },
    topUpWallet: async (amount, slipUrl) => {
        return (await api.post('/ads/wallet/topup', { amount, slip_url: slipUrl })).data;
    },
    getTransactions: async () => {
        const response = await api.get('/ads/wallet/transactions');
        return response.data;
    },
    getDashboardStats: async () => {
        const response = await api.get('/ads/dashboard');
        return response.data;
    },
    getDailyBurn: async () => {
        const response = await api.get('/ads/stats/daily-burn');
        return response.data;
    },

    // --- Public / System ---
    serveAd: async (placement) => {
        try {
            const response = await api.get(`/ads/serve?placement=${placement}`);
            return response.data;
        } catch (error) {
            console.error("Ad Serve Error", error);
            return { served: false };
        }
    },
    recordView: async (adId, placement) => {
        try {
            await api.post('/ads/record-view', { adId, placement });
        } catch (error) {
            console.error("Ad View Record Error", error);
        }
    },
    recordClick: async (adId, placement) => {
        try {
            await api.post('/ads/record-click', { adId, placement });
        } catch (error) {
            console.error("Ad Click Record Error", error);
        }
    },

    // --- Admin ---
    getAllSponsors: async () => {
        const response = await api.get('/ads/admin/sponsors');
        return response.data;
    },
    suspendSponsor: async (id) => {
        const response = await api.patch(`/ads/admin/sponsors/${id}/suspend`);
        return response.data;
    },
    getPlatformStats: async () => {
        const response = await api.get('/ads/admin/stats');
        return response.data;
    },
    getAdsConfig: async () => {
        const response = await api.get('/ads/admin/config');
        return response.data;
    },
    updateAdsConfig: async (config) => {
        const response = await api.post('/ads/admin/config', config);
        return response.data;
    },
    // View As Feature
    getSponsorDetails: async (sponsorId) => {
        // Reuse wallet endpoint which supports overrides if admin
        const wallet = await api.get(`/ads/wallet?sponsorId=${sponsorId}`);
        return wallet.data;
    },
    adjustSponsorWallet: async (sponsorId, amount, reason) => {
        const response = await api.post(`/ads/admin/sponsors/${sponsorId}/adjust-wallet`, { amount, reason });
        return response.data;
    }
};

export default adsApi;
