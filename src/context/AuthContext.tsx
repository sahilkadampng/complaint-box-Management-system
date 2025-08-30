import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    role?: 'student' | 'faculty';
    profilePicture?: string;
    password?: string;
    createdBy?: string;
    createdAt?: string;
    department?: string;
    yearOfStudy?: string;
    program?: string;
    phoneNumber?: string;
    studentId?: string;
    rollNumber?: string;
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
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
        }
    }, []);

    // ---------------- LOGIN ----------------
    const login = (username: string, password: string, role: 'student' | 'faculty'): boolean => {
        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');

        // ✅ Find by username + password + role
        const foundUser = users.find(
            u =>
                u.username === username &&
                u.password === password &&
                u.role === role
        );

        if (!foundUser) return false;

        // Remove password before storing
        const safeUser = { ...foundUser };
        delete safeUser.password;

        setUser(safeUser);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(safeUser));

        return true;
    };

    // ---------------- SIGNUP (FIXED) ----------------
    const signup = (userData: Omit<User, 'id'>): boolean => {
        const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');

        // Username duplicate only within SAME ROLE
        const usernameExists = users.some(
            (u) => u.username === userData.username && u.role === userData.role
        );
        if (usernameExists) return false;

        const newUser: User = {
            ...userData,
            id: Date.now().toString(),
            createdAt: userData.createdAt ?? new Date().toLocaleString(),
            createdBy: userData.createdBy ?? "system",
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        return true;
    };

    // ---------------- LOGOUT ----------------
    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('currentUser');
    };

    // ---------------- SET ROLE ----------------
    const setUserRole = (role: 'student' | 'faculty') => {
        if (user) {
            const updatedUser = { ...user, role };
            setUser(updatedUser);
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
    };

    // ---------------- UPDATE USER ----------------
    const updateUser = async (data: Partial<User> & { password?: string }) => {
        if (!user) return;

        const updatedUser = { ...user, ...data };
        setUser(updatedUser);

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
