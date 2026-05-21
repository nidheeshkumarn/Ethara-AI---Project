import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // On page load, check if they are already logged in
        const token = localStorage.getItem('access_token');
        if (token) {
            setUser(jwtDecode(token)); // Decodes token to get { user_id: 1, role: 'admin' }
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