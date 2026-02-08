import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import Loader from "@/components/Loader"; // adjust path

interface LoaderContextType {
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const LoaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState(!navigator.onLine); // show loader if offline

    // Network detection
    useEffect(() => {
        const handleOffline = () => setLoading(true);   // show loader when offline
        const handleOnline = () => {
            setLoading(false);                             // hide loader when online
            window.location.reload();                      // refresh page when back online
        };

        window.addEventListener("offline", handleOffline);
        window.addEventListener("online", handleOnline);

        return () => {
            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("online", handleOnline);
        };
    }, []);

    return (
        <LoaderContext.Provider value={{ loading, setLoading }}>
            {children}
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                    <Loader />
                </div>
            )}
        </LoaderContext.Provider>
    );
};

export const useLoader = () => {
    const context = useContext(LoaderContext);
    if (!context) throw new Error("useLoader must be used within LoaderProvider");
    return context;
};
