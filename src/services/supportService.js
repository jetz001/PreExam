import api from './api';

const supportService = {
    createTicket: async (ticketData) => {
        const response = await api.post('/support/tickets', ticketData);
        return response.data;
    },

    getMyTickets: async () => {
        const response = await api.get('/support/tickets/my');
        return response.data;
    },

    getTicketDetails: async (ticketId) => {
        const response = await api.get(`/support/tickets/${ticketId}`);
        return response.data;
    },

    sendMessage: async (ticketId, messageData) => {
        const response = await api.post(`/support/tickets/${ticketId}/messages`, messageData);
        return response.data;
    },

    updateStatus: async (ticketId, status) => {
        const response = await api.patch(`/support/tickets/${ticketId}/status`, { status });
        return response.data;
    },

    // Admin
    getAdminTickets: async () => {
        const response = await api.get('/support/admin/tickets');
        return response.data;
    }
};

export default supportService;
