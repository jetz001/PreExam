import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
<<<<<<< HEAD
                const currentUser = authService.getCurrentUser();
                console.log('[AuthContext] Fetched user from storage:', currentUser);
                setUser(currentUser);
            } catch (error) {
                console.error("[AuthContext] Error fetching user", error);
=======
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
>>>>>>> bacce2c141b692c2a538f5cce56dc456713d2cde
                setUser(null);
            } finally {
                setLoading(false);
                console.log('[AuthContext] Initial loading complete');
            }
        };

        initAuth();
    }, []);

<<<<<<< HEAD
    const login = async (email, password) => {
        const data = await authService.login({ email, password });
=======
    const login = async (userData) => {
        const data = await authService.login(userData);
>>>>>>> bacce2c141b692c2a538f5cce56dc456713d2cde
        setUser(data.user);
        return data;
    };

<<<<<<< HEAD
    const googleLogin = async (credential) => {
        const data = await authService.googleLogin(credential);
=======
    const register = async (userData) => {
        const data = await authService.register(userData);
        setUser(data.user);
        return data;
    };

    const googleLogin = async (token) => {
        const data = await authService.googleLogin(token);
>>>>>>> bacce2c141b692c2a538f5cce56dc456713d2cde
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
<<<<<<< HEAD
        <AuthContext.Provider value={{ user, login, googleLogin, facebookLogin, logout, updateUser, loading, isAuthenticated: !!user }}>
=======
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
>>>>>>> bacce2c141b692c2a538f5cce56dc456713d2cde
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
