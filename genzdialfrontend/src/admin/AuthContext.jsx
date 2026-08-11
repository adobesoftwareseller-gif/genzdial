import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api.js';

const AuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '');
    const [admin, setAdmin] = useState(() => {
        try { return JSON.parse(localStorage.getItem('admin_user') || 'null'); } catch { return null; }
    });

    useEffect(() => {
        if (token) {
            localStorage.setItem('admin_token', token);
            api.defaults.headers.common.Authorization = `Bearer ${token}`;
        } else {
            localStorage.removeItem('admin_token');
            delete api.defaults.headers.common.Authorization;
        }
    }, [token]);

    useEffect(() => {
        if (admin) localStorage.setItem('admin_user', JSON.stringify(admin));
        else localStorage.removeItem('admin_user');
    }, [admin]);

    const login = async (email, password) => {
        const { data } = await api.post('/admin/login', { email, password });
        setToken(data.token);
        setAdmin(data.admin);
        return data;
    };

    const logout = () => {
        setToken('');
        setAdmin(null);
    };

    return (
        <AuthContext.Provider value={{ token, admin, login, logout, isAuthed: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAdminAuth = () => useContext(AuthContext);
