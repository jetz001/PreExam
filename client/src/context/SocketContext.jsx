import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            // Determine Socket URL
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const socketUrl = isLocal
                ? 'http://127.0.0.1:3000'
                : '/'; // Use relative path for production

            const newSocket = io(socketUrl, {
                auth: { token: localStorage.getItem('token') },
                transports: ['websocket', 'polling'], // Try websocket first (or both)
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 1000,
            });

            newSocket.on('connect_error', (err) => {
                console.warn('Socket connection error:', err);
            });

            newSocket.on('connect', () => {
                console.log('Socket connected successfully:', newSocket.id);
                newSocket.emit('join_user', user.id);
            });
            setSocket(newSocket);

            return () => newSocket.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
