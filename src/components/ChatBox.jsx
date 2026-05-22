import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ChatBox = ({ socket, roomId, userId, displayName }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const { user } = useAuth();

    useEffect(() => {
        if (!socket) return;

        socket.on('receive_message', (message) => {
            setMessages((prev) => [...prev, message]);

            // Notification Logic
            if (message.userId !== userId && user?.notify_study_group) {
                // Play Sound
                const audio = new Audio('/sounds/notification.mp3'); // Ensure this file exists or use a CDN/Data URI
                audio.play().catch(e => console.log('Audio play failed', e));

                // Show Toast
                toast(`${message.displayName}: ${message.message.substring(0, 30)}${message.message.length > 30 ? '...' : ''}`, {
                    icon: '💬',
                    duration: 4000
                });
            }
        });

        return () => {
            socket.off('receive_message');
        };
    }, [socket, userId, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (input.trim() && socket) {
            socket.emit('send_message', {
                roomId,
                userId,
                message: input,
                displayName
            });
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <h3 className="font-bold text-gray-700">Chat Room</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 h-64">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.userId === userId ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-2 ${msg.userId === userId
                            ? 'bg-blue-500 text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`}>
                            <p className="text-xs opacity-75 mb-1 font-bold">{msg.displayName}</p>
                            <p className="text-sm">{msg.message}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-3 border-t border-gray-200 flex">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                    type="submit"
                    className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
};

export default ChatBox;
