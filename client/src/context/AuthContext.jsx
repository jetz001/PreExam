import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = authService.getCurrentUser();
                console.log('[AuthContext] Fetched user from storage:', currentUser);
                setUser(currentUser);
            } catch (error) {
                console.error("[AuthContext] Error fetching user", error);
                setUser(null);
            } finally {
                setLoading(false);
                console.log('[AuthContext] Initial loading complete');
            }
        };

        fetchUser();
    }, []);

    const login = async (email, password) => {
        const data = await authService.login({ email, password });
        setUser(data.user);
        return data;
    };

    const googleLogin = async (credential) => {
        const data = await authService.googleLogin(credential);
        setUser(data.user);
        return data;
    };

    const facebookLogin = async (accessToken, userID) => {
        const data = await authService.facebookLogin(accessToken, userID);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        window.location.href = '/login';
    };

    const updateUser = (userData) => {
        // Merges new data with existing user data
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, googleLogin, facebookLogin, logout, updateUser, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
