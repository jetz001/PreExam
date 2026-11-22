import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    MessageSquare,
    Send,
    MoreVertical,
    ArrowLeft,
    Inbox,
    Sparkles
} from 'lucide-react';
import businessApi from '../../services/businessApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const BusinessInbox = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingInbox, setIsLoadingInbox] = useState(true);
    const [myBusinessId, setMyBusinessId] = useState(null);
    const messagesEndRef = useRef(null);

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `${path.startsWith('/') ? '' : '/'}${path}`;
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

    const filteredConversations = conversations.filter((chat) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const name = (chat.user?.display_name || '').toLowerCase();
        const preview = (chat.lastMessage || '').toLowerCase();
        return name.includes(q) || preview.includes(q);
    });

    if (isLoadingInbox) {
        return (
            <div
                className="rounded-2xl bg-white border border-slate-200/80 shadow-sm h-[calc(100vh-140px)] min-h-[480px] flex flex-col items-center justify-center gap-3 p-8"
                role="status"
                aria-label="Loading Inbox"
            >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 animate-pulse">
                    <Inbox size={22} />
                </div>
                <p className="text-sm font-semibold text-slate-600">Loading Inbox...</p>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-132px)] sm:h-[calc(100vh-116px)] min-h-[520px] bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Chat List Sidebar */}
            <div
                className={`${
                    activeConversation ? 'hidden md:flex' : 'flex'
                } w-full md:w-80 lg:w-96 border-r border-slate-200/80 flex-col bg-white shrink-0`}
            >
                <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-white space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                                <MessageSquare size={18} />
                            </div>
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                                    Inbox
                                </h2>
                                <p className="text-xs text-slate-500 font-medium">
                                    Customer Inquiries
                                </p>
                            </div>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                            {conversations.length}
                        </span>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            aria-label="Search conversations"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {filteredConversations.length === 0 && (
                        <div className="text-center px-6 py-12">
                            <div className="mx-auto mb-3 w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
                                <Inbox size={20} />
                            </div>
                            <p className="text-sm font-semibold text-slate-700">
                                {conversations.length === 0 ? 'No messages yet.' : 'No matching conversations.'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                Customer messages will appear here automatically.
                            </p>
                        </div>
                    )}

                    {filteredConversations.map((chat, index) => {
                        const isSelected = activeConversation?.user.id === chat.user.id;
                        return (
                            <button
                                key={chat.user?.id || index}
                                type="button"
                                onClick={() => setActiveConversation(chat)}
                                className={`w-full text-left p-4 flex gap-3.5 cursor-pointer transition-all hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 border-l-4 ${
                                    isSelected
                                        ? 'bg-indigo-50/70 border-l-indigo-600'
                                        : 'border-l-transparent bg-white'
                                }`}
                            >
                                <div className="relative shrink-0">
                                    <div className="w-11 h-11 bg-gradient-to-br from-indigo-100 to-violet-100 border border-indigo-200/70 rounded-full flex items-center justify-center text-indigo-700 font-bold overflow-hidden">
                                        {chat.user.avatar ? (
                                            <img
                                                src={getImageUrl(chat.user.avatar)}
                                                alt={chat.user.display_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            chat.user.display_name.charAt(0)
                                        )}
                                    </div>
                                    {chat.unread > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                                            {chat.unread}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline gap-2 mb-1">
                                        <h3 className={`text-sm truncate ${chat.unread > 0 ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                                            {chat.user.display_name}
                                        </h3>
                                        <span className="text-xs font-medium text-slate-500 shrink-0">
                                            {new Date(chat.time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className={`text-sm truncate ${chat.unread > 0 ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>
                                        {chat.lastMessage}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div
                className={`${
                    activeConversation ? 'flex' : 'hidden md:flex'
                } flex-1 flex-col bg-slate-50 min-w-0`}
            >
                {!activeConversation ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4">
                            <Sparkles size={28} />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">
                            Select a conversation
                        </h3>
                        <p className="text-sm text-slate-600 mt-1 max-w-xs">
                            Choose a customer thread from the list to view message history and reply directly.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 border-b border-slate-200/80 bg-white px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <button
                                    type="button"
                                    onClick={() => setActiveConversation(null)}
                                    aria-label="Back to conversations"
                                    className="md:hidden p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-violet-100 border border-indigo-200/70 rounded-full flex items-center justify-center text-indigo-700 font-bold overflow-hidden shrink-0">
                                    {activeConversation.user.avatar ? (
                                        <img
                                            src={getImageUrl(activeConversation.user.avatar)}
                                            alt={activeConversation.user.display_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        activeConversation.user.display_name.charAt(0)
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                                        {activeConversation.user.display_name}
                                    </h3>
                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                        Customer
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    aria-label="Conversation options"
                                    className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/90">
                            {messages.map((msg, index) => {
                                // In Business Inbox:
                                // 'user' sender = Customer (Received, Left)
                                // 'business' sender = Me/Owner (Sent, Right)
                                const isMe = msg.sender_type === 'business';

                                return (
                                    <div
                                        key={msg.id || index}
                                        className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-1 overflow-hidden ${
                                                isMe
                                                    ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm'
                                                    : 'bg-indigo-100 text-indigo-700 border border-indigo-200/70'
                                            }`}
                                        >
                                            {isMe
                                                ? (user?.business_name?.charAt(0) || 'Me')
                                                : (activeConversation.user.avatar ? (
                                                    <img
                                                        src={getImageUrl(activeConversation.user.avatar)}
                                                        alt={activeConversation.user.display_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : activeConversation.user.display_name.charAt(0))
                                            }
                                        </div>

                                        <div className="min-w-0">
                                            <div
                                                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${
                                                    isMe
                                                        ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm'
                                                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-sm'
                                                }`}
                                            >
                                                <p className="whitespace-pre-wrap">{msg.message}</p>
                                            </div>
                                            <div className={`flex items-center gap-1 mt-1.5 ${isMe ? 'justify-end' : 'justify-start ml-1'}`}>
                                                <span className="text-xs font-medium text-slate-500">
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
                        <div className="p-3 sm:p-4 border-t border-slate-200/80 bg-white shrink-0">
                            <form className="flex gap-2.5 sm:gap-3 items-end" onSubmit={handleSendMessage}>
                                <div className="flex-1 bg-slate-50 rounded-xl px-3.5 py-2.5 border border-slate-200 focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                                    <textarea
                                        placeholder="Type your reply..."
                                        aria-label="Reply message"
                                        className="w-full bg-transparent border-none text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded resize-none max-h-32"
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
                                    aria-label="Send message"
                                    className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white p-3 rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shrink-0"
                                >
                                    <Send size={18} />
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
