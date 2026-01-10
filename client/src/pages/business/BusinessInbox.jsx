import React, { useState, useEffect, useRef } from 'react';
import { Search, User, MessageSquare, Clock, Send, MoreVertical, Phone, Video } from 'lucide-react';
import businessApi from '../../services/businessApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const BusinessInbox = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [isLoadingInbox, setIsLoadingInbox] = useState(true);
    const [myBusinessId, setMyBusinessId] = useState(null);
    const messagesEndRef = useRef(null);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `http://localhost:3000${path}`;
    };

    // 1. Fetch Inbox (Conversations)
    useEffect(() => {
        fetchInbox();
        // Poll for new conversations/messages
        const interval = setInterval(fetchInbox, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchInbox = async () => {
        try {
            // First we need our business ID. Ideally this comes from context or auth,
            // but we can deduce it from the API call or a separate call.
            // Actually getInbox logic finds business by owner_uid.
            const res = await businessApi.getInbox();
            if (res.success) {
                setConversations(res.conversations);
                setIsLoadingInbox(false);

                // Set business ID if needed for sending messages.
                // The API determines business based on user, but we need it for the payload.
                // We'll fetch 'my business' once to get the ID.
                if (!myBusinessId) {
                    businessApi.getMyBusiness().then(r => {
                        if (r.success) setMyBusinessId(r.business.id);
                    }).catch(() => { });
                }
            }
        } catch (error) {
            console.error("Error fetching inbox", error);
            setIsLoadingInbox(false);
        }
    };

    // 2. Fetch Messages when Active Chat changes
    useEffect(() => {
        if (activeConversation && myBusinessId) {
            const fetchChat = async () => {
                try {
                    // getMessages needs business_id. We know we are the business owner.
                    // We need to pass the target user_id to get specific conversation.
                    const res = await businessApi.getMessages(myBusinessId, activeConversation.user.id);
                    if (res.success) {
                        setMessages(res.messages);
                        scrollToBottom();
                    }
                } catch (error) {
                    console.error("Error fetching chat", error);
                }
            };
            fetchChat();
            // Polling for active chat
            const interval = setInterval(fetchChat, 5000);
            return () => clearInterval(interval);
        }
    }, [activeConversation, myBusinessId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !activeConversation || !myBusinessId) return;

        try {
            const res = await businessApi.sendMessage({
                business_id: myBusinessId,
                message: messageInput,
                to_user_id: activeConversation.user.id // Important for business reply
            });

            if (res.success) {
                setMessages([...messages, res.message]);
                setMessageInput('');
                scrollToBottom();
            }
        } catch (error) {
            toast.error('Failed to send reply');
        }
    };

    if (isLoadingInbox) return <div className="p-10 text-center">Loading Inbox...</div>;

    return (
        <div className="flex h-[calc(100vh-100px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Chat List Sidebar */}
            <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
                <div className="p-4 border-b border-gray-200 bg-white">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <MessageSquare size={20} className="text-blue-600" /> Inbox
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-lg text-sm transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 && (
                        <div className="text-center p-8 text-gray-400 text-sm">No messages yet.</div>
                    )}
                    {conversations.map((chat, index) => (
                        <div
                            key={index}
                            onClick={() => setActiveConversation(chat)}
                            className={`p-4 flex gap-3 cursor-pointer transition-colors hover:bg-white ${activeConversation?.user.id === chat.user.id ? 'bg-white border-l-4 border-l-blue-600 shadow-sm' : 'border-l-4 border-l-transparent'}`}
                        >
                            <div className="relative">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                                    {chat.user.avatar ? <img src={getImageUrl(chat.user.avatar)} className="w-full h-full object-cover" /> : chat.user.display_name.charAt(0)}
                                </div>
                                {chat.unread > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full border-2 border-white">
                                        {chat.unread}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className={`text-sm truncate ${chat.unread > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                        {chat.user.display_name}
                                    </h3>
                                    <span className="text-xs text-gray-400">
                                        {new Date(chat.time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <p className={`text-sm truncate ${chat.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                    {chat.lastMessage}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {!activeConversation ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MessageSquare size={48} className="mb-4 opacity-50" />
                        <p>Select a conversation to start messaging</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold overflow-hidden">
                                    {activeConversation.user.avatar ? <img src={getImageUrl(activeConversation.user.avatar)} className="w-full h-full object-cover" /> : activeConversation.user.display_name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{activeConversation.user.display_name}</h3>
                                    <span className="text-xs text-gray-500">Customer</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-400">
                                <button className="hover:text-gray-600"><MoreVertical size={20} /></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                            {messages.map((msg, index) => {
                                // In Business Inbox:
                                // 'user' sender = Customer (Received, Left)
                                // 'business' sender = Me/Owner (Sent, Right)
                                const isMe = msg.sender_type === 'business';

                                return (
                                    <div key={index} className={`flex gap-4 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-1 overflow-hidden ${isMe ? 'bg-blue-600 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                                            {isMe
                                                ? 'Me'
                                                : (activeConversation.user.avatar ? <img src={getImageUrl(activeConversation.user.avatar)} className="w-full h-full object-cover" /> : activeConversation.user.display_name.charAt(0))
                                            }
                                        </div>
                                        <div>
                                            <div className={`p-4 rounded-2xl shadow-sm border ${isMe
                                                ? 'bg-blue-600 text-white rounded-tr-none border-blue-600'
                                                : 'bg-white text-gray-800 rounded-tl-none border-gray-100'
                                                }`}>
                                                <p>{msg.message}</p>
                                            </div>
                                            <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start ml-2'}`}>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <form className="flex gap-4 items-end" onSubmit={handleSendMessage}>
                                <div className="flex-1 bg-gray-50 rounded-xl p-2 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                                    <textarea
                                        placeholder="Type your reply..."
                                        className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm max-h-32"
                                        rows="1"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!messageInput.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BusinessInbox;
