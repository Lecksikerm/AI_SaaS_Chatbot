import { createContext, useContext, useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios';

const AuthContext = createContext(null);

// Create axios instance with auth header
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://ai-chatbot-58g6.onrender.com',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Add auth token to requests
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
        } catch (err) {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { access_token, user: userData } = res.data;
        localStorage.setItem('token', access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        setUser(userData);
        return userData;
    };

    const register = async (email, password, name) => {
        const res = await api.post('/auth/register', { email, password, name });
        const { access_token, user: userData } = res.data;
        localStorage.setItem('token', access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        setUser(userData);
        return userData;
    };

    const googleLogin = async (credential) => {
        const res = await api.post('/auth/google', { token: credential });
        const { access_token, user: userData } = res.data;
        localStorage.setItem('token', access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
            return res.data;
        } catch (err) {
            console.error('Failed to refresh user:', err);
            return null;
        }
    };

    const value = {
        user,
        login,
        register,
        googleLogin,
        logout,
        loading,
        isAuthenticated: !!user,
        api,
        refreshUser,
    };

    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <AuthContext.Provider value={value}>
                {children}
            </AuthContext.Provider>
        </GoogleOAuthProvider>
    );
};

export const useAuth = () => useContext(AuthContext);