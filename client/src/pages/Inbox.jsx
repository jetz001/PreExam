import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, User, ChevronLeft } from 'lucide-react';
import chatApi from '../../services/chatApi';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const Inbox = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedFriendId, setSelectedFriendId] = useState(null);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [newMessage, setNewMessage] = useState('');

    // Fetch conversations list
    const { data: conversations = [], isLoading: loadingConversations } = useQuery({
        queryKey: ['inboxConversations'],
        queryFn: chatApi.getInboxConversations,
        enabled: !!user
    });

    // Fetch messages for selected friend
    const { data: messages = [], isLoading: loadingMessages } = useQuery({
        queryKey: ['messages', selectedFriendId],
        queryFn: () => chatApi.getMessages(selectedFriendId),
        enabled: !!selectedFriendId,
        refetchInterval: 5000 // Poll every 5s for new messages
    });

    const markReadMutation = useMutation({
        mutationFn: chatApi.markRead,
        onSuccess: () => {
            queryClient.invalidateQueries(['inboxConversations']);
        }
    });

    const sendMessageMutation = useMutation({
        mutationFn: ({ friendId, message }) => chatApi.sendMessage(friendId, message),
        onSuccess: () => {
            setNewMessage('');
            queryClient.invalidateQueries(['messages', selectedFriendId]);
            queryClient.invalidateQueries(['inboxConversations']);
        }
    });

    const handleSelectConversation = (conv) => {
        setSelectedFriendId(conv.friend_id);
        setSelectedFriend({ id: conv.friend_id, display_name: conv.display_name, avatar: conv.avatar });
        if (conv.unread_count > 0) {
            markReadMutation.mutate(conv.friend_id);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedFriendId) return;
        sendMessageMutation.mutate({ friendId: selectedFriendId, message: newMessage });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar />
            <div className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex h-[70vh] min-h-[500px]">

                    {/* Left Pane: Conversations List */}
                    <div className={`w-full md:w-1/3 border-r border-slate-200 flex flex-col ${selectedFriendId ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-slate-200 bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center">
                                <MessageSquare className="mr-2 text-indigo-600" /> กล่องข้อความ
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {loadingConversations ? (
                                <div className="p-6 text-center text-slate-500">กำลังโหลด...</div>
                            ) : conversations.length === 0 ? (
                                <div className="p-6 text-center text-slate-500">ไม่มีข้อความ</div>
                            ) : (
                                conversations.map((conv) => (
                                    <div
                                        key={conv.friend_id}
                                        onClick={() => handleSelectConversation(conv)}
                                        className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${selectedFriendId === conv.friend_id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''}`}
                                    >
                                        <div className="flex items-center">
                                            {conv.avatar ? (
                                                <img src={conv.avatar} alt="avatar" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-slate-200 flex flex-col items-center justify-center text-slate-500">
                                                    <User size={24} />
                                                </div>
                                            )}
                                            <div className="ml-3 flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h3 className="text-sm font-bold text-slate-800 truncate">{conv.display_name || 'Admin'}</h3>
                                                    <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                                        {new Date(conv.last_message_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 truncate">{conv.last_sender_id === user?.id ? 'คุณ: ' : ''}{conv.last_message}</p>
                                            </div>
                                            {conv.unread_count > 0 && (
                                                <div className="ml-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                    {conv.unread_count}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Pane: Chat Window */}
                    <div className={`w-full md:w-2/3 flex flex-col ${!selectedFriendId ? 'hidden md:flex' : 'flex'}`}>
                        {selectedFriendId ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-slate-200 bg-white flex items-center shadow-sm z-10">
                                    <button
                                        onClick={() => setSelectedFriendId(null)}
                                        className="md:hidden mr-3 text-slate-500 hover:text-slate-800"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    {selectedFriend.avatar ? (
                                        <img src={selectedFriend.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover mr-3 border border-slate-200" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-500 mr-3">
                                            <User size={20} />
                                        </div>
                                    )}
                                    <h3 className="font-bold text-slate-800 text-lg">{selectedFriend.display_name || 'Admin'}</h3>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
                                    {loadingMessages ? (
                                        <div className="text-center text-slate-500">กำลังโหลดข้อความ...</div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center text-slate-500 h-full flex items-center justify-center flex-col">
                                            <MessageSquare size={48} className="text-slate-300 mb-4" />
                                            <p>เริ่มการสนทนา</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, idx) => {
                                            const isMe = msg.sender_id === user?.id;
                                            return (
                                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-sm'}`}>
                                                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                                        <span className={`text-[10px] block mt-1 ${isMe ? 'text-indigo-200 text-right' : 'text-slate-400'}`}>
                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Message Input */}
                                <div className="p-4 bg-white border-t border-slate-200">
                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="พิมพ์ข้อความ..."
                                            className="flex-1 border border-slate-300 rounded-full px-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                            disabled={sendMessageMutation.isLoading}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || sendMessageMutation.isLoading}
                                            className={`p-2 rounded-full flex items-center justify-center transition-colors 
                                                ${!newMessage.trim() ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                        >
                                            <Send size={20} className={newMessage.trim() ? 'ml-1' : ''} />
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                                <MessageSquare size={64} className="mb-4 text-slate-300" />
                                <p className="text-lg">เลือกข้อความเพื่ออ่าน</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Inbox;
