import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface NetworkContextType {
    isOnline: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            window.location.reload(); // refresh page when connection comes back
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return (
        <div className="font-vend">
            <NetworkContext.Provider value={{ isOnline }}>
                {children}
            </NetworkContext.Provider>
        </div>
    );
};

export const useNetwork = () => {
    const context = useContext(NetworkContext);
    if (!context) throw new Error("useNetwork must be used within NetworkProvider");
    return context;
};
