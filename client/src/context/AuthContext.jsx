import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                let currentUser = authService.getCurrentUser();

                if (!currentUser) {
                    try {
                        const guestConfig = await authService.guestLogin();
                        currentUser = guestConfig.user;
                    } catch (guestError) {
                        console.error("Guest login failed during init", guestError);
                    }
                }

                setUser(currentUser);
            } catch (error) {
                console.error("Error initializing auth", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (userData) => {
        const data = await authService.login(userData);
        setUser(data.user);
        return data;
    };

    const register = async (userData) => {
        const data = await authService.register(userData);
        setUser(data.user);
        return data;
    };

    const googleLogin = async (token) => {
        const data = await authService.googleLogin(token);
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
        <AuthContext.Provider value={{
            user,
            login,
            register,
            googleLogin,
            facebookLogin,
            logout,
            updateUser,
            loading,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
