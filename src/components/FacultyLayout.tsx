// FacultyLayout.tsx
import React from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

const FacultyLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen relative">
            {/* Navbar */}
            <Navbar />

            {/* Watermark covering whole screen */}
            {user?.name && (
                <div className="fixed inset-0 flex flex-wrap justify-center items-center opacity-25 pointer-events-none z-0">
                    {Array(50) // number of repeats, adjust as needed
                        .fill(user.name)
                        .map((name, idx) => (
                            <span
                                key={idx}
                                className="text-lg font-bold text-gray-400 m-16"
                                style={{ transform: "rotate(45deg)" }}
                            >
                                {name}
                            </span>
                        ))}
                </div>
            )}

            {/* Main content */}
            <div className="relative z-10">{children}</div>
        </div>
    );
};

export default FacultyLayout;
