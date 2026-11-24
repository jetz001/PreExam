import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                let currentUser = authService.getCurrentUser();

                if (currentUser && authService.getToken()) {
                    // Refresh the user data from the server in the background
                    authService.fetchCurrentUser().then(freshUser => {
                        if (freshUser) setUser(freshUser);
                    });
                } else if (!currentUser) {
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
                console.log('[AuthContext] Initial loading complete');
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

    const updateUser = useCallback((userData) => {
        // Merges new data with existing user data
        setUser((prev) => {
            const updatedUser = { ...prev, ...userData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        });
    }, []);

    const refreshUser = useCallback(async () => {
        const freshUser = await authService.fetchCurrentUser();
        if (freshUser) {
            setUser(freshUser);
        }
        return freshUser;
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            googleLogin,
            facebookLogin,
            logout,
            updateUser,
            refreshUser,
            loading,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
