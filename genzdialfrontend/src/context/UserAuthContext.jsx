import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import api from '../api.js';

const UserAuthContext = createContext(null);
const TOKEN_KEY = 'user_token';
const USER_KEY = 'user_info';

export function UserAuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
        catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
    const [loginOpen, setLoginOpen] = useState(false);
    const [signupOpen, setSignupOpen] = useState(false);
    const pendingActionRef = useRef(null);

    useEffect(() => {
        if (token) api.defaults.headers.common.UserAuthorization = `Bearer ${token}`;
        else delete api.defaults.headers.common.UserAuthorization;
    }, [token]);

    // Called after Firebase phone-OTP verification succeeds on the client.
    // Sends the Firebase ID token to our backend, which verifies it via
    // firebase-admin, upserts the User record, and returns our own JWT.
    const loginWithFirebase = useCallback((idToken, opts = {}) =>
        api.post('/auth/firebase-login', {
            idToken,
            name: opts.name,
        }).then((r) => {
            const { token: t, user: u } = r.data;
            localStorage.setItem(TOKEN_KEY, t);
            localStorage.setItem(USER_KEY, JSON.stringify(u));
            setToken(t);
            setUser(u);
            setLoginOpen(false);
            setSignupOpen(false);
            const pending = pendingActionRef.current;
            pendingActionRef.current = null;
            if (typeof pending === 'function') {
                setTimeout(() => pending(), 0);
            }
            return r.data;
        }), []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
    }, []);

    const openLogin = useCallback(() => { setSignupOpen(false); setLoginOpen(true); }, []);
    const closeLogin = useCallback(() => {
        pendingActionRef.current = null;
        setLoginOpen(false);
    }, []);
    const openSignup = useCallback(() => { setLoginOpen(false); setSignupOpen(true); }, []);
    const closeSignup = useCallback(() => {
        pendingActionRef.current = null;
        setSignupOpen(false);
    }, []);

    const requireAuth = useCallback((onSuccess) => {
        if (user) { onSuccess?.(); return true; }
        pendingActionRef.current = typeof onSuccess === 'function' ? onSuccess : null;
        setLoginOpen(true);
        return false;
    }, [user]);

    return (
        <UserAuthContext.Provider
            value={{ user, token, loginOpen, signupOpen, openLogin, closeLogin, openSignup, closeSignup, loginWithFirebase, logout, requireAuth }}
        >
            {children}
        </UserAuthContext.Provider>
    );
}

export const useUserAuth = () => useContext(UserAuthContext);
