import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Mail, MessageCircle, Check } from 'lucide-react';

const Inbox = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/messages');
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">กล่องข้อความ & Feedback</h2>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div>Loading...</div>
                ) : messages.map((msg) => (
                    <div key={msg.id} className={`bg-white p-6 rounded-lg shadow-sm border-l-4 ${msg.category === 'bug' ? 'border-red-500' : msg.category === 'sponsor' ? 'border-green-500' : 'border-blue-500'}`}>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center">
                                <div className={`p-2 rounded-full mr-4 ${msg.category === 'bug' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {msg.category === 'bug' ? <ShieldAlert className="h-6 w-6" /> : <Mail className="h-6 w-6" />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                        {msg.subject || 'No Subject'}
                                        {msg.type === 'report' && (
                                            <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">Report</span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-gray-500">From: {msg.email} • {new Date(msg.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-green-600">
                                <Check className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="mt-4 text-gray-700 whitespace-pre-wrap">
                            {msg.message}
                            {msg.type === 'report' && msg.original_data && (
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                    <p className="text-sm text-gray-500">Question ID: {msg.original_data.question_id}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {messages.length === 0 && !loading && (
                    <div className="text-center text-gray-500 py-12">ไม่มีข้อความใหม่</div>
                )}
            </div>
        </div>
    );
};

// Helper icon
const ShieldAlert = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
);

export default Inbox;
