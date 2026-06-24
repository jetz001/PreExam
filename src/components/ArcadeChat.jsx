import React, { useState, useEffect, useRef } from 'react';
import { createRoomRealtimeClient } from '../services/roomRealtimeClient';
import api from '../services/api';

export default function ArcadeChat() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [unread, setUnread] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const chatEndRef = useRef(null);
    const clientRef = useRef(null);

    useEffect(() => {
        // Retrieve current user info
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setCurrentUser(JSON.parse(userStr));
            } catch (e) { }
        }
    }, []);

    useEffect(() => {
        if (!isOpen) return; // Only connect when chat is open to save resources

        const token = localStorage.getItem('token');
        const userId = currentUser?.id || 'guest_' + Math.floor(Math.random() * 10000);
        
        let baseUrl = api.defaults.baseURL || window.location.origin;
        if (baseUrl.startsWith('/')) {
            baseUrl = window.location.origin + baseUrl;
        }
        
        const client = createRoomRealtimeClient({
            baseUrl,
            path: '/api/ws',
            token,
            userId
        });
        clientRef.current = client;

        client.on('connect', () => {
            setIsConnected(true);
            // Join global arcade chat room
            client.emit('join_room', { roomId: 'arcade_global', userId });
        });

        client.on('disconnect', () => {
            setIsConnected(false);
        });

        client.on('receive_message', (data) => {
            setMessages(prev => {
                const newMsgs = [...prev, data];
                return newMsgs.slice(-50); // Keep last 50 msgs
            });
            if (!isOpen) {
                setUnread(u => u + 1);
            }
        });

        client.on('user_joined', (data) => {
             // Optional: system message
        });

        return () => {
            client.disconnect();
            clientRef.current = null;
        };
    }, [isOpen, currentUser]);

    useEffect(() => {
        if (isOpen && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
            setUnread(0);
        }
    }, [messages, isOpen]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !clientRef.current?.connected) return;

        const displayName = currentUser?.display_name || currentUser?.username || 'Guest';
        
        const msgData = {
            roomId: 'arcade_global',
            text: inputValue,
            senderName: displayName,
            senderId: currentUser?.id,
            timestamp: new Date().toISOString()
        };

        clientRef.current.emit('send_message', msgData);
        setInputValue('');
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 left-6 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 transition-all z-[9999] flex items-center justify-center group"
            >
                <div className="text-2xl">💬</div>
                {unread > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
                        {unread}
                    </span>
                )}
                <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ml-0 group-hover:ml-2 font-bold">
                    หาเพื่อนเล่นเกม
                </span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 left-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-[9999] h-[500px] max-h-[80vh]">
            {/* Header */}
            <div className="bg-[#1e1b4b] text-white p-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                    <span className="text-xl">💬</span>
                    <div>
                        <h3 className="font-black text-lg leading-none">Arcade Chat</h3>
                        <p className="text-xs text-indigo-300 mt-1 flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-500'}`}></span>
                            {isConnected ? 'เชื่อมต่อแล้ว' : 'กำลังเชื่อมต่อ...'}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsOpen(false)}
                    className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-all"
                >
                    ✕
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm mt-10">
                        ยังไม่มีข้อความ...<br/>พิมพ์ทักทายหาเพื่อนเล่นเกมกันเลย!
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = currentUser?.id ? msg.senderId === currentUser.id : msg.senderName === (currentUser?.display_name || 'Guest');
                        return (
                            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && <span className="text-xs text-gray-500 mb-1 ml-1 font-bold">{msg.senderName}</span>}
                                <div className={`px-4 py-2 rounded-2xl max-w-[85%] break-words ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 shadow-sm rounded-tl-sm'}`}>
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex gap-2">
                <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="พิมพ์ข้อความ..."
                    className="flex-1 bg-gray-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={!isConnected}
                />
                <button 
                    type="submit" 
                    disabled={!isConnected || !inputValue.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-md"
                >
                    ➤
                </button>
            </form>
        </div>
    );
}
