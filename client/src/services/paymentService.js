import api from './api';

const paymentService = {
    createCheckoutSession: async (data) => {
        // data: { packageId, amount, type, businessId, planId, metadata }
        const response = await api.post('/payments/create-checkout-session', data);
        return response.data; // Expecting { url: '...' }
    },

    getPlans: async () => {
        const response = await api.get('/payments/plans');
        return response.data;
    },

    getQRCode: async (amount) => {
        // Mock response to prevent crash. 
        // In production, this might call an API to generate a dynamic QR or return a static one.
        return {
            qrCode: `https://promptpay.io/0812345678/${amount}.png`, // Placeholder PromptPay ID
            bankDetails: {
                bank: "Krungthai Bank",
                account: "981-4-53030-1",
                name: "PreExam Co., Ltd."
            }
        };
    },

    createTransaction: async (data) => {
        const response = await api.post('/payments/checkout', data);
        return response.data;
    },

    uploadSlip: async (formData) => {
        const response = await api.post('/payments/upload-slip', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};

export default paymentService;
