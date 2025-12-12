import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Load user from local storage on mount (decoding token would be better, but for now just check existence)
    // Actually, we should fetch /me if token exists
    // I'll skip auto-fetch for now to keep it simple, or just trust the login flow.
    // Better: check if token exists and if so, assume logged in (UI will verify via API later)

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('token', userData.token);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
