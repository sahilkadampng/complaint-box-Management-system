import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

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
    section?: string;
    // Notification preferences
    emailAlerts?: boolean;
    systemMessages?: boolean;
}


interface AuthContextType {
    user: User | null;
    login: (username: string, password: string, role: 'student' | 'faculty') => Promise<boolean>; 
    signup: (userData: Omit<User, 'id'>) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    setUserRole: (role: 'student' | 'faculty') => Promise<void>;
    updateUser: (data: Partial<User> & { password?: string }) => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper: normalize API user object to frontend `User` shape (ensure `id` exists)
const normalizeUser = (u: any): User | null => {
    if (!u) return null;
    return {
        id: (u._id ?? u.id ?? '').toString(),
        name: u.name ?? '',
        username: u.username ?? '',
        email: u.email ?? '',
        role: u.role,
        profilePicture: u.profilePicture,
        createdBy: u.createdBy,
        createdAt: u.createdAt,
        department: u.department,
        yearOfStudy: u.yearOfStudy,
        program: u.program,
        phoneNumber: u.phoneNumber,
        studentId: u.studentId,
        rollNumber: u.rollNumber,
        section: u.section,
        emailAlerts: typeof u.emailAlerts === 'boolean' ? u.emailAlerts : true,
        systemMessages: typeof u.systemMessages === 'boolean' ? u.systemMessages : true,
    } as User;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Clean up any legacy 'currentUser' left in localStorage (migration)
        try { localStorage.removeItem('currentUser'); } catch (e) { /* ignore */ }

        // If we have a token, fetch current user from backend and populate state (token-only storage)
        const token = localStorage.getItem('token');
        if (!token) return;

        (async () => {
            try {
                const res = await apiClient.getCurrentUser();
                if (!res.error && res.data?.user) {
                    const normalized = normalizeUser(res.data.user);
                    if (normalized) {
                        setUser(normalized);
                        setIsAuthenticated(true);
                    }
                } else {
                    // Invalid/expired token: remove it
                    localStorage.removeItem('token');
                }
            } catch (err) {
                console.error('Failed to fetch current user on init:', err);
                localStorage.removeItem('token');
            }
        })();
    }, []);

    // ---------------- LOGIN (BACKEND) ----------------
    const login = async (username: string, password: string, role: 'student' | 'faculty'): Promise<boolean> => {
        try {
            const res = await apiClient.login(username, password, role);
            if (res.error || !res.data) return false;

            const { token, user } = res.data;
            if (!token || !user) return false;

            // Persist only token (avoid storing user in localStorage)
            localStorage.setItem('token', token);

            const normalized = normalizeUser(user);
            if (normalized) {
                setUser(normalized);
                setIsAuthenticated(true);
                return true;
            }

            return false;
        } catch (err) {
            console.error('Login error:', err);
            return false;
        }
    }; 

    // ---------------- SIGNUP (BACKEND) ----------------
    const signup = async (userData: Omit<User, 'id'>): Promise<{ success: boolean; error?: string }> => {
        try {
            const res = await apiClient.signup(userData);
            if (res.error) return { success: false, error: res.error };

            if (res.data && res.data.token && res.data.user) {
                const { token, user: userFromApi } = res.data;
                // Persist only token (avoid storing user in localStorage)
                localStorage.setItem('token', token);

                const normalized = normalizeUser(userFromApi);
                if (normalized) {
                    setUser(normalized);
                    setIsAuthenticated(true);
                }

                return { success: true };
            }

            return { success: false, error: 'Unexpected API response' };
        } catch (err: any) {
            console.error('Signup error:', err);
            return { success: false, error: err?.message || 'Signup failed' };
        }
    }; 

    // ---------------- LOGOUT ----------------
    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        // Clear token and any legacy currentUser data
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
    };

    // ---------------- SET ROLE ----------------
    const setUserRole = async (role: 'student' | 'faculty') => {
        if (!user) return;
        // Use updateUser which will call backend and update state
        await updateUser({ role });
    };

    // ---------------- UPDATE USER ----------------
    const updateUser = async (data: Partial<User> & { password?: string }) => {
        if (!user) return;

        try {
            const res = await apiClient.updateProfile(data);
            if (res.error) {
                console.error('Update profile error:', res.error);
                return;
            }

            if (res.data && res.data.user) {
                const updatedUser = res.data.user as User;
                setUser(updatedUser);
            }
        } catch (err) {
            console.error('Failed to update user:', err);
        }
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
