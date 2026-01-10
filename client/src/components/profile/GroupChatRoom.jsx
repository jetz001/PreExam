import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Send, X, Users } from 'lucide-react';
import studyGroupService from '../../services/studyGroupService';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const GroupChatRoom = ({ group, onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const bottomRef = useRef(null);
    const socket = useSocket();

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await studyGroupService.getMessages(group.id);
                setMessages(res.data || []);
            } catch (error) {
                console.error("Failed to load messages");
            }
        };
        fetchMessages();

        if (socket) {
            socket.emit('join_group', `group_${group.id}`); // Check backend room format
            socket.on('group_message', (msg) => setMessages(prev => [...prev, msg]));
        }
        return () => socket?.off('group_message');
    }, [group.id, socket]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            // Optimistic update
            const tempMsg = {
                id: Date.now(),
                user_id: user.id,
                sender: { display_name: user?.display_name, avatar: user?.avatar },
                message: newMessage,
                created_at: new Date().toISOString()
            };
            setMessages(prev => [...prev, tempMsg]);
            setNewMessage('');

            await studyGroupService.sendMessage(group.id, tempMsg.message);
        } catch (error) {
            console.error("Failed to send message");
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Users size={20} />
                        <div>
                            <h3 className="font-bold">{group.name}</h3>
                            <span className="text-xs opacity-80">{group.members} members</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X size={20} /></button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-900">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-400 mt-20">No messages yet. Start the conversation!</div>
                    ) : (
                        messages.map(msg => {
                            const isMe = msg.user_id === user?.id;
                            const sender = msg.Sender || msg.sender || {};
                            return (
                                <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 overflow-hidden">
                                        <img
                                            src={sender.avatar ? `http://localhost:3000${sender.avatar}` : `https://ui-avatars.com/api/?name=${sender.display_name}`}
                                            alt="avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm'}`}>
                                        <p className={`text-xs font-bold mb-1 opacity-70 ${isMe ? 'text-right text-blue-100' : ''}`}>{sender.display_name}</p>
                                        <p>{msg.message}</p>
                                        <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-800 border-t dark:border-slate-700 flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition dark:text-white"
                    />
                    <button type="submit" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md disabled:opacity-50" disabled={!newMessage.trim()}>
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default GroupChatRoom;
