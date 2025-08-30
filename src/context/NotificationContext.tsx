import React, { createContext, useContext, useState } from 'react';

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    removeNotification: (id: string) => void;
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = (notification: Omit<Notification, 'id'>) => {
        const id = Date.now().toString();
        const newNotification = { ...notification, id };

        setNotifications(prev => [...prev, newNotification]);

        // Auto remove notification after duration (default 5 seconds)
        setTimeout(() => {
            removeNotification(id);
        }, notification.duration || 5000);
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Helper functions for convenience
    const showSuccess = (message: string, duration?: number) => {
        addNotification({ type: 'success', message, duration });
    };

    const showError = (message: string, duration?: number) => {
        addNotification({ type: 'error', message, duration });
    };

    const showWarning = (message: string, duration?: number) => {
        addNotification({ type: 'warning', message, duration });
    };

    const showInfo = (message: string, duration?: number) => {
        addNotification({ type: 'info', message, duration });
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            addNotification,
            removeNotification,
            showSuccess,
            showError,
            showWarning,
            showInfo
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
