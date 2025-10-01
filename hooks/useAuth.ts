import { useState, useCallback } from 'react';

const AUTH_KEY = 'techiral_admin_auth';

// IMPORTANT: This is a simple client-side password for deterrent purposes only.
// In a real application, this would be handled by a secure backend server.
// Change this password to something personal and private.
const ADMIN_PASSWORD = 'password123'; 

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        // Check session storage on initial load
        return sessionStorage.getItem(AUTH_KEY) === 'true';
    });

    const login = useCallback((password: string): boolean => {
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem(AUTH_KEY, 'true');
            setIsAuthenticated(true);
            return true;
        }
        return false;
    }, []);

    const logout = useCallback(() => {
        sessionStorage.removeItem(AUTH_KEY);
        setIsAuthenticated(false);
    }, []);

    return { isAuthenticated, login, logout };
};
