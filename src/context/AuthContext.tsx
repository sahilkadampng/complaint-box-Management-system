import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    role?: 'student' | 'faculty';
    profilePicture?: string;
    password?: string; // stored only for login verification (optional)
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string, role: 'student' | 'faculty') => boolean;
    signup: (userData: Omit<User, 'id'>) => boolean;
    logout: () => void;
    setUserRole: (role: 'student' | 'faculty') => void;
    updateUser: (data: Partial<User> & { password?: string }) => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Load current user from localStorage on mount
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
        }
    }, []);

    const login = (username: string, password: string, role: 'student' | 'faculty'): boolean => {
        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const foundUser = users.find(u => u.username === username && u.password === password);

        if (foundUser) {
            const userWithRole = { ...foundUser, role };
            delete userWithRole.password; // remove password for safety
            setUser(userWithRole);
            setIsAuthenticated(true);
            localStorage.setItem('currentUser', JSON.stringify(userWithRole));
            return true;
        }

        return false;
    };

    const signup = (userData: Omit<User, 'id'>): boolean => {
        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');

        if (users.find(u => u.username === userData.username)) {
            return false; // username already exists
        }

        const newUser: User = {
            ...userData,
            id: Date.now().toString(),
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        return true;
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('currentUser');
    };

    const setUserRole = (role: 'student' | 'faculty') => {
        if (user) {
            const updatedUser = { ...user, role };
            setUser(updatedUser);
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
    };

    const updateUser = async (data: Partial<User> & { password?: string }) => {
        if (!user) return;

        const updatedUser = { ...user, ...data };
        setUser(updatedUser);

        // Update users array in localStorage
        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
        const index = users.findIndex(u => u.id === user.id);
        if (index !== -1) {
            users[index] = { ...users[index], ...data };
            localStorage.setItem('users', JSON.stringify(users));
        }

        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            signup,
            logout,
            setUserRole,
            updateUser,
            isAuthenticated
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
