import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User } from 'lucide-react';
import businessApi from '../../services/businessApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const BusinessChatModal = ({ isOpen, onClose, businessId, businessName, businessLogo }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen && businessId) {
            fetchMessages();
            // Optional: Set up polling
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [isOpen, businessId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await businessApi.getMessages(businessId, user?.id); // For user, we just want their chat
            if (res.success) {
                setMessages(res.messages);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await businessApi.sendMessage({
                business_id: businessId,
                message: newMessage
            });
            if (res.success) {
                setMessages([...messages, res.message]);
                setNewMessage('');
            }
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
            <div className="fixed inset-0 bg-black/50 pointer-events-auto" onClick={onClose} />
            <div className="bg-white w-full sm:w-[400px] h-[500px] sm:rounded-2xl shadow-2xl flex flex-col pointer-events-auto sm:mb-0 relative overflow-hidden z-50">
                {/* Header */}
                <div className="bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full overflow-hidden flex items-center justify-center">
                            {businessLogo ? <img src={businessLogo} className="w-full h-full object-cover" /> : <User />}
                        </div>
                        <div>
                            <h3 className="font-bold">{businessName}</h3>
                            <span className="text-xs text-indigo-200">Typically replies within an hour</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-indigo-700 p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.length === 0 && (
                        <div className="text-center text-gray-400 mt-10">
                            <p>Start a conversation with {businessName}</p>
                        </div>
                    )}
                    {messages.map((msg, index) => {
                        const isMe = msg.sender_type === 'user';
                        return (
                            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm border ${isMe
                                    ? 'bg-blue-600 text-white rounded-tr-none border-blue-600'
                                    : 'bg-white text-gray-800 rounded-tl-none border-gray-200'
                                    }`}>
                                    <p className="text-sm">{msg.message}</p>
                                    <span className={`text-[10px] block mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 bg-white border-t border-gray-200">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-100 text-gray-900 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-full px-4 py-2 transition-all outline-none"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                        >
                            <Send size={20} className="ml-0.5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BusinessChatModal;
