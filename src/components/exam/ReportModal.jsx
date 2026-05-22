import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import reportService from '../../services/reportService';

const ReportModal = ({ questionId, onClose }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim()) return;

        setLoading(true);
        try {
            await reportService.submitReport(questionId, reason);
            alert('ขอบคุณสำหรับการแจ้งปัญหา เราจะตรวจสอบโดยเร็วที่สุด');
            onClose();
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('เกิดข้อผิดพลาดในการส่งรายงาน');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold flex items-center text-red-600">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        แจ้งปัญหาข้อสอบ
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            รายละเอียดปัญหา
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 h-32 focus:ring-red-500 focus:border-red-500"
                            placeholder="เช่น เฉลยผิด, โจทย์ไม่ชัดเจน, รูปภาพไม่แสดง..."
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                            {loading ? 'กำลังส่ง...' : 'ส่งรายงาน'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;
