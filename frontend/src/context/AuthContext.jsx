import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // On page load, check if they are already logged in
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                setUser(jwtDecode(token));
            } catch (error) {
                localStorage.removeItem('access_token');
                setUser(null);
            }
        }
    }, []);

    const login = (token) => {
        localStorage.setItem('access_token', token);
        setUser(jwtDecode(token));
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};