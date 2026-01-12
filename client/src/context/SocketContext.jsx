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
            // Fix for Windows localhost resolution: force 127.0.0.1 if localhost
            const hostname = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;
            const socketUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                ? `${window.location.protocol}//${hostname}:3000`
                : window.location.origin;

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
