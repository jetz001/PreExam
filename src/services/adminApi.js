import * as XLSX from 'xlsx';
import api from './api';

const pickExcelField = (normalizedRow, candidates) => {
    for (const candidate of candidates) {
        const key = candidate.toLowerCase();
        if (normalizedRow[key] !== undefined && normalizedRow[key] !== null && String(normalizedRow[key]).trim() !== '') {
            return String(normalizedRow[key]).trim();
        }
    }
    return '';
};

const normalizeImportedAnswer = (rawAnswer) => {
    const val = String(rawAnswer || '').trim();
    if (!val) return 'A';
    const thaiMap = { ก: 'A', ข: 'B', ค: 'C', ง: 'D' };
    if (thaiMap[val]) return thaiMap[val];
    const cleaned = val.replace(/^option\s*/i, '').replace(/^choice\s*/i, '').trim().toUpperCase();
    if (['A', 'B', 'C', 'D'].includes(cleaned)) return cleaned;
    const firstChar = cleaned.charAt(0);
    if (['A', 'B', 'C', 'D'].includes(firstChar)) return firstChar;
    return 'A';
};

const parseSpreadsheetRows = async (file) => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) return [];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    return rawRows
        .map((row) => {
            const normalizedRow = {};
            for (const [key, value] of Object.entries(row)) {
                normalizedRow[String(key).trim().toLowerCase()] = value;
            }

            const questionText = pickExcelField(normalizedRow, [
                'question_text',
                'question text',
                'question',
                'โจทย์',
                'คำถาม',
                'q'
            ]);
            if (!questionText) return null;

            const choiceA = pickExcelField(normalizedRow, ['choice_a', 'option a', 'option_a', 'choice a', 'a', 'ก', 'ตัวเลือก a']);
            const choiceB = pickExcelField(normalizedRow, ['choice_b', 'option b', 'option_b', 'choice b', 'b', 'ข', 'ตัวเลือก b']);
            const choiceC = pickExcelField(normalizedRow, ['choice_c', 'option c', 'option_c', 'choice c', 'c', 'ค', 'ตัวเลือก c']);
            const choiceD = pickExcelField(normalizedRow, ['choice_d', 'option d', 'option_d', 'choice d', 'd', 'ง', 'ตัวเลือก d']);
            const correctAnswer = normalizeImportedAnswer(
                pickExcelField(normalizedRow, ['correct_answer', 'correct answer', 'answer', 'ans', 'เฉลย', 'คำตอบ'])
            );
            const subject = pickExcelField(normalizedRow, ['subject', 'วิชา']) || 'General';
            const rawCatalogs = pickExcelField(normalizedRow, ['catalogs', 'category', 'หมวดหมู่', 'tags', 'tag']);
            const catalogs = rawCatalogs
                ? rawCatalogs.split(',').map((s) => s.trim()).filter(Boolean)
                : [];
            const explanation = pickExcelField(normalizedRow, ['explanation', 'คำอธิบาย', 'อธิบาย', 'เฉลยละเอียด']);
            const examYear = pickExcelField(normalizedRow, ['exam_year', 'exam year', 'ปี', 'year']);
            const examSet = pickExcelField(normalizedRow, ['exam_set', 'exam set', 'ชุดข้อสอบ', 'set']);
            const skill = pickExcelField(normalizedRow, ['skill', 'ทักษะ']);

            return {
                question_text: questionText,
                choices: { A: choiceA, B: choiceB, C: choiceC, D: choiceD },
                choice_a: choiceA,
                choice_b: choiceB,
                choice_c: choiceC,
                choice_d: choiceD,
                correct_answer: correctAnswer,
                subject,
                catalogs,
                category: catalogs[0] || '',
                explanation,
                exam_year: examYear || null,
                exam_set: examSet || null,
                skill: skill || null
            };
        })
        .filter(Boolean);
};

const adminApi = {
    getExamSets: async () => { const response = await api.get('/admin/exam-sets'); return response.data; },
    getUniqueCatalogs: async () => { const response = await api.get('/admin/catalogs'); return response.data; },
    getCatalogCounts: async () => { const response = await api.get('/admin/catalogs/counts'); return response.data; },
    createExamSet: async (data) => { const response = await api.post('/admin/exam-sets', data); return response.data; },
    updateExamSet: async (id, data) => { const response = await api.put(`/admin/exam-sets/${id}`, data); return response.data; },
    deleteExamSet: async (id) => { const response = await api.delete(`/admin/exam-sets/${id}`); return response.data; },
    // Dashboard Overview
    getDashboardStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    // Room Assets
    getAssets: async (type) => {
        const url = type ? `/assets?type=${type}` : '/assets';
        const response = await api.get(url);
        return response.data.data;
    },
    createAsset: async (formData) => {
        // 1. Upload the file to R2 via /upload endpoint
        const fileData = new FormData();
        fileData.append('file', formData.get('image'));
        
        const uploadRes = await api.post('/upload', fileData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (!uploadRes.data.success) {
            throw new Error('Failed to upload file to R2');
        }

        // 2. Save the metadata to /assets endpoint
        const payload = {
            name: formData.get('name'),
            type: formData.get('type'),
            is_premium: formData.get('is_premium') === 'true',
            url: uploadRes.data.url
        };

        const response = await api.post('/assets', payload);
        return response.data;
    },
    updateAsset: async (id, data) => {
        const response = await api.put(`/assets/${id}`, data);
        return response.data;
    },
    deleteAsset: async (id) => {
        const response = await api.delete(`/assets/${id}`);
        return response.data;
    },

    // Question Manager
    getQuestions: async (filters) => {
        const response = await api.get('/questions', { params: { orderBy: 'id', ...filters } });
        return response.data.data;
    },
    getSubjects: async () => {
        const response = await api.get('/questions/subjects');
        return response.data.data;
    },
    getCategories: async () => {
        const response = await api.get('/questions/categories');
        return response.data.data;
    },
    importQuestions: async (formData) => {
        const file = formData instanceof FormData ? formData.get('file') : formData;
        if (file && typeof file.arrayBuffer === 'function') {
            const parsedRows = await parseSpreadsheetRows(file);
            if (parsedRows.length > 0) {
                try {
                    const response = await api.post('/questions/bulk', { questions: parsedRows });
                    return response.data;
                } catch (bulkError) {
                    const status = bulkError?.response?.status;
                    if (status !== 404 && status !== 405) {
                        throw bulkError;
                    }
                }
            }
        }
        const response = await api.post('/questions/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    createQuestion: async (data) => {
        const response = await api.post('/questions', data);
        return response.data;
    },
    updateQuestion: async (id, data) => {
        const response = await api.put(`/questions/${id}`, data);
        return response.data;
    },
    deleteQuestion: async (id) => {
        const response = await api.delete(`/questions/${id}`);
        return response.data;
    },
    getAllUserQuestions: async () => {
        const response = await api.get('/admin/user-questions');
        return response.data;
    },
    updateUserQuestion: async (id, data) => {
        const response = await api.put(`/admin/user-questions/${id}`, data);
        return response.data;
    },
    deleteUserQuestion: async (id) => {
        const response = await api.delete(`/admin/user-questions/${id}`);
        return response.data;
    },

    // Payment Verification
    getPendingPayments: async () => {
        const response = await api.get('/admin/payments');
        return (response.data || []).filter(p => p.status === 'pending');
    },
    getPaymentHistory: async () => {
        const response = await api.get('/admin/payments');
        return (response.data || []).filter(p => p.status !== 'pending');
    },
    approvePayment: async (id, type) => {
        const response = await api.post(`/admin/payments/${id}/approve`, { type });
        return response.data;
    },
    rejectPayment: async (id, reason, type) => {
        const response = await api.post(`/admin/payments/${id}/reject`, { reason, type });
        return response.data;
    },

    // Payment Plans
    getPaymentPlans: async () => {
        const response = await api.get('/admin/payments/plans');
        return response.data.plans;
    },
    createPaymentPlan: async (data) => {
        const response = await api.post('/admin/payments/plans', data);
        return response.data;
    },
    updatePaymentPlan: async (id, data) => {
        const response = await api.put(`/admin/payments/plans/${id}`, data);
        return response.data;
    },
    deletePaymentPlan: async (id) => {
        const response = await api.delete(`/admin/payments/plans/${id}`);
        return response.data;
    },

    // User Manager
    getUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },
    updateUser: async (id, data) => {
        const response = await api.put(`/admin/users/${id}`, data);
        return response.data;
    },
    updateUserRole: async (id, role) => {
        const response = await api.put(`/admin/users/${id}`, { role });
        return response.data;
    },
    updateUserPermissions: async (id, permissions) => {
        const response = await api.put(`/admin/users/${id}/permissions`, { permissions });
        return response.data;
    },
    getUserHistory: async (id) => {
        const response = await api.get(`/admin/users/${id}/history`);
        return response.data;
    },
    getUserLogs: async (id) => {
        const response = await api.get(`/admin/users/${id}/logs`);
        return response.data;
    },
    updateUserStatus: async (id, status) => {
        const response = await api.put(`/admin/users/${id}/status`, { status });
        return response.data;
    },

    // News Manager
    getNews: async () => {
        const response = await api.get('/news');
        return response.data.data;
    },
    createNews: async (data) => {
        const response = await api.post('/news', data);
        return response.data;
    },
    updateNews: async (id, data) => {
        const response = await api.put(`/news/${id}`, data);
        return response.data;
    },
    deleteNews: async (id) => {
        const response = await api.delete(`/news/${id}`);
        return response.data;
    },
    scrapeWeb: async (url) => {
        const response = await api.post('/news/scrape', { url });
        return response.data.data;
    },
    // News Sources (Collection)
    getSources: async () => {
        const response = await api.get('/news/sources/all');
        return response.data.data;
    },
    createSource: async (data) => {
        const response = await api.post('/news/sources', data);
        return response.data;
    },
    deleteSource: async (id) => {
        const response = await api.delete(`/news/sources/${id}`);
        return response.data;
    },

    // Inbox & Reports
    // Inbox & Reports
    getMessages: async () => {
        const response = await api.get('/admin/messages');
        return response.data;
    },
    broadcastMessage: async (data) => {
        const response = await api.post('/admin/messages/broadcast', data);
        return response.data;
    },
    // Adding standard sendMessage proxy if admin needs to send 1:1 specifically from admin panel
    // Or we can just use the broadcast endpoint with a single userId
    getReports: async () => {
        const response = await api.get('/admin/reports');
        return response.data;
    },

    // Settings & Assets
    getAssets: async () => {
        const response = await api.get('/assets');
        return response.data.data;
    },
    uploadAsset: async (data) => {
        const response = await api.post('/assets', data);
        return response.data;
    },
    uploadFileToR2: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    deleteAsset: async (id) => {
        const response = await api.delete(`/assets/${id}`);
        return response.data;
    },

    // Room Manager
    getActiveRooms: async () => {
        const response = await api.get('/rooms?limit=100');
        return response.data.data.map(room => ({
            id: room.id,
            name: room.name,
            mode: room.mode,
            participants: room.participant_count || 0
        }));
    },
    closeRoom: async (id) => {
        const response = await api.delete(`/rooms/${id}`);
        return response.data;
    },
    // Ad Management
    getPendingAds: async () => {
        const response = await api.get('/admin/ads/pending');
        return response.data;
    },
    approveAd: async (id) => {
        const response = await api.post(`/admin/ads/${id}/approve`);
        return response.data;
    },
    rejectAd: async (id) => {
        const response = await api.post(`/admin/ads/${id}/reject`);
        return response.data;
    },

    // System Settings
    getSystemSettings: async () => {
        const response = await api.get('/admin/settings');
        return response.data;
    },
    updateSystemSettings: async (settings) => {
        const response = await api.put('/admin/settings', settings);
        return response.data;
    },
    // Legal & Policy
    getPrivacyPolicy: async () => {
        const response = await api.get('/legal/policy');
        return response.data;
    },
    updatePrivacyPolicy: async (content) => {
        const response = await api.put('/legal/policy', { content });
        return response.data;
    },
    toggleNewsFeature: async (id) => {
        const response = await api.put(`/news/${id}/feature`);
        return response.data;
    },
    startGenerator: async () => {
        const response = await api.post('/admin/generator/start');
        return response.data;
    },
    // Season Management
    getSeasons: async () => {
        const response = await api.get('/admin/seasons');
        return response.data;
    },
    createSeason: async (data) => {
        const response = await api.post('/admin/seasons', data);
        return response.data;
    },
    updateSeason: async (id, data) => {
        const response = await api.put(`/admin/seasons/${id}`, data);
        return response.data;
    }
};

export default adminApi;
