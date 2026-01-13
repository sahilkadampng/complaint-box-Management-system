// Sidebar.tsx
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Users, Download, BarChart3, UserCog, LogOut, MoveLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const StudentSidebar: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);

    //  Listen for global event from any page (e.g. FacultyDashboard)
    useEffect(() => {
        const handler = () => setOpen(prev => !prev);
        window.addEventListener("toggleSidebar", handler);
        return () => window.removeEventListener("toggleSidebar", handler);
    }, []);

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        return parts.length > 1
            ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
            : parts[0][0].toUpperCase();
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>

            {/* Sidebar Drawer */}
            <div className={` font-body
    fixed top-0 left-0 h-full w-64 bg-white shadow-md p-0
    flex flex-col gap-3
    transform transition-transform duration-300
    z-[150]
    md:sticky md:top-0 md:h-screen
    md:translate-x-0
    ${open ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* Profile */}
                <div
                    className="flex flex-col bg-gradient-to-r from-[#0099b5] to-[#00bcd4] items-center mb-1 mt-[4rem] cursor-pointer group"
                    onClick={() => navigate('/profile')}
                >
                    <Avatar className="h-20 w-20 ring-2 ring-primary/30 shadow mt-4">
                        {user?.profilePicture ? (
                            <AvatarImage src={user.profilePicture} alt={user.name} />
                        ) : (
                            <AvatarFallback className="bg-primary text-white text-xl">
                                {getInitials(user?.name)}
                            </AvatarFallback>
                        )}
                    </Avatar>

                    <div className="flex items-center mt-2 space-x-2">
                        <p className="font-semibold text-gray-700 group-hover:text-primary transition">
                            {user?.name || "User"}
                        </p>
                        <img
                            src="https://cdn-icons-png.flaticon.com/128/2722/2722987.png"
                            alt="profile-icon"
                            className="h-4 w-4 opacity-70 group-hover:opacity-100"
                        />
                    </div>

                    <p className="text-xs text-gray-500 mb-4">{user?.email || "user@dpu.edu"}</p>
                </div>

                <hr className='mt-[-16px]' />

                {/* Navigation */}
                <Button className="justify-start bg-white-100 text-black shadow shadow-card rounded-md hover:bg-gray-50"
                    onClick={() => navigate('/student/dashboard')}>
                    <MoveLeft className="h-4 w-4 mr-2" /> Dashboard
                </Button>

                <Button className="justify-start bg-white-100 text-black shadow shadow-card rounded-md hover:bg-gray-50"
                    onClick={() => navigate('/student/complaint/new')}>
                    <Users className="h-4 w-4 mr-2" /> Register New User
                </Button>

                <Button className="justify-start bg-white-100 text-black shadow shadow-card rounded-md hover:bg-gray-50"
                    onClick={() => navigate('/student/complaints"')}>
                    <Download className="h-4 w-4 mr-2" /> Reports
                </Button>

                <Button className="justify-start bg-white-100 text-black shadow shadow-card rounded-md hover:bg-gray-50"
                    onClick={() => navigate('/student/analytics')}>
                    <BarChart3 className="h-4 w-4 mr-2" /> Analytics
                </Button>

                <Button className="justify-start bg-white-100 text-black shadow shadow-card rounded-md hover:bg-gray-50"
                    onClick={() => navigate('/student/help')}>
                    <UserCog className="h-4 w-4 mr-2" /> User Management
                </Button>
                {/* 
                <Button className="justify-start bg-white-100 text-black shadow shadow-card rounded-md hover:bg-gray-50"
                    onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4 mr-2" /> Settings
                </Button>

                <Button className="justify-start bg-white-100 text-black shadow shadow-card rounded-md hover:bg-gray-50"
                    onClick={() => navigate('/help')}>
                    <HelpCircle className="h-4 w-4 mr-2" /> Help
                </Button> */}

                <hr className="mt-[5rem]" />

                <Button className="justify-start bg-white-100 text-black shadow shadow-card rounded-md hover:bg-red-50"
                    onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
            </div>

            {/* Dark Overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 md:hidden z-40"
                    onClick={() => setOpen(false)}
                />
            )}
        </>
    );
};

export default StudentSidebar;
