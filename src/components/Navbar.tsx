import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { LogOut, User, Bell, AlertCircle, Clock, MessageSquare, Zap } from 'lucide-react';
import { apiClient } from '@/lib/api';
import dpuImg from '@/assets/DYPDPUUnitechsocietylogo1.png';

const Navbar: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [notificationCount, setNotificationCount] = useState(0);
    const [complaints, setComplaints] = useState<any[]>([]);
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [notificationTab, setNotificationTab] = useState<'all' | 'unread'>('unread');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getInitials = (name?: string | null) => {
        if (!name) return 'U';
        const parts = name.trim().split(/\s+/);
        const first = parts[0]?.[0] ?? '';
        const second = parts[1]?.[0] ?? '';
        return `${first}${second}`.toUpperCase() || 'U';
    };

    const markComplaintAsRead = async (complaintId: string) => {
        try {
            await apiClient.patch(`/complaints/${complaintId}/read`, {});
        } catch (error) {
            console.error('Error marking complaint as read:', error);
        }
    };

    const handleComplaintClick = (complaintId: string, path: string) => {
        markComplaintAsRead(complaintId);
        navigate(path);
    };

    // Load complaints and calculate notifications based on role
    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const response = await apiClient.getComplaints({ limit: 1000 });
                if (response.data?.complaints) {
                    setComplaints(response.data.complaints);

                    if (user?.role === 'faculty') {
                        // For faculty: count unread complaints with "submitted" status
                        const newComplaints = response.data.complaints.filter(
                            (c: any) => c.status === 'submitted' && !c.isRead
                        );
                        setNotificationCount(newComplaints.length);
                    } else if (user?.role === 'student') {
                        // For student: count unread complaints that are not in "submitted" or "resolved" status
                        const updatedComplaints = response.data.complaints.filter(
                            (c: any) => c.status !== 'submitted' && c.status !== 'resolved' && !c.isRead
                        );
                        setNotificationCount(updatedComplaints.length);
                    }
                }
            } catch (error) {
                console.error('Error loading notifications:', error);
            }
        };

        if (isAuthenticated && user) {
            loadNotifications();
            // Refresh every 30 seconds
            const interval = setInterval(loadNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, user?.role, user?.id]);

    // SINGLE useEffect (fixed)
    useEffect(() => {
        const handler = () => setSidebarOpen(prev => !prev);
        window.addEventListener("toggleSidebar", handler);
        return () => window.removeEventListener("toggleSidebar", handler);
    }, []);

    return (
        <div className="font-body">
            <nav className="fixed top-0 z-50 w-full border-b border-border bg-card/70 backdrop-blur shadow-card md:pl-0">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16">
                        <div className="flex items-center">
                            <div className="md:hidden flex items-center">
                                <button
                                    onClick={() => window.dispatchEvent(new Event("toggleSidebar"))}
                                    className="relative w-5 h-5 flex flex-col justify-center items-center group bg-white/80 bg-opacity-0 rounded-m mt-1"
                                >
                                    <span
                                        className={`
                                            block h-[3px] w-7 bg-gray-800 rounded transition-all duration-300
                                            ${sidebarOpen ? "rotate-45 translate-y-[8px] w-8" : ""}
                                        `}
                                    />
                                    <span
                                        className={`
                                            block h-[3px] w-7 bg-gray-800 rounded my-[6px]
                                            ${sidebarOpen ? "opacity-0 bg-white" : ""}
                                        `}
                                    />
                                    <span
                                        className={`
                                            block h-[3px] w-7 bg-gray-800 rounded transition-all duration-300
                                            ${sidebarOpen ? "-rotate-45 -translate-y-[8px] w-8" : ""}
                                        `}
                                    />
                                </button>
                            </div>

                            {sidebarOpen ? (
                                <div className="hidden md:flex items-center ml-5 opacity-50 pointer-events-none md:pointer-events-auto transition-opacity duration-200">
                                    <img src={dpuImg} width={90} height={90} alt="logo" />
                                </div>
                            ) : (
                                <Link to="/" className="hidden md:flex items-center ml-5">
                                    <img src={dpuImg} width={90} height={90} alt="logo" />
                                </Link>
                            )}
                        </div>

                        <div className="flex-1" />

                        {isAuthenticated && user ? (
                            <div className="flex items-center space-x-4">
                                {/* Notification Bell */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="relative hover:bg-transparent focus:bg-transparent"
                                        >
                                            <Bell className="h-5 w-5 text-gray-600" />
                                            {notificationCount > 0 && (
                                                <span className="absolute top-1 right-1 flex items-center justify-center h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full">
                                                    {notificationCount > 9 ? '9+' : notificationCount}
                                                </span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[380px] p-0 shadow-lg border border-gray-200 rounded-lg" align="end">
                                        {/* Header */}
                                        <div className="bg-white px-5 py-4 border-b border-gray-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-bold text-gray-900 text-sm">
                                                    {user?.role === 'faculty' ? 'Notification' : 'Notification'}
                                                </h3>
                                                <p className="text-gray-500 text-xs">
                                                    {notificationCount} unread
                                                </p>
                                            </div>
                                            {/* Tabs */}
                                            <div className="flex gap-2 w-6">
                                                <button
                                                    onClick={() => setNotificationTab('all')}
                                                    className={`flex-1 py-2 px-3 w-10 text-xs font-medium rounded-md transition-colors ${notificationTab === 'all'
                                                        ? 'bg-gray-200 text-black'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    ALL
                                                </button>
                                                <button
                                                    onClick={() => setNotificationTab('unread')}
                                                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${notificationTab === 'unread'
                                                        ? 'bg-gray-200 text-black'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    UNREAD
                                                </button>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="max-h-[380px] overflow-y-auto">
                                            {complaints.length === 0 ? (
                                                <div className="py-8 px-5 text-center">
                                                    <Bell className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                                    <p className="text-gray-500 text-sm">No notifications</p>
                                                </div>
                                            ) : user?.role === 'faculty' ? (
                                                // Faculty view: filter by tab
                                                <div className="divide-y divide-gray-100 flex items-center gap-2">
                                                    {complaints
                                                        .filter((c: any) => {
                                                            const isSubmitted = c.status === 'submitted';
                                                            if (notificationTab === 'unread') {
                                                                return isSubmitted && !c.isRead;
                                                            }
                                                            return isSubmitted;
                                                        })
                                                        .slice(0, 5)
                                                        .map((complaint: any) => (
                                                            <div
                                                                key={complaint._id}
                                                                className={`px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${!complaint.isRead ? 'bg-blue-50' : 'bg-white'
                                                                    }`}
                                                                onClick={() => handleComplaintClick(complaint._id, `/faculty-dashboard/complaint/${complaint._id}`)}
                                                            >
                                                                <div className="flex gap-3 items-start">
                                                                    {!complaint.isRead && (
                                                                        <div className="flex-shrink-0 mt-0.5">
                                                                            <div className="h-2 w-2 rounded-full bg-blue-600 mt-1.5" />
                                                                        </div>
                                                                    )}
                                                                    <div className="flex items-center gap-3 flex-wrap">
                                                                        <p className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">
                                                                            {complaint.title}
                                                                        </p>
                                                                        <p className="text-xs text-gray-600">
                                                                            {complaint.studentName}
                                                                        </p>
                                                                        <p className="text-[11px] text-gray-400">
                                                                            {new Date(complaint.createdAt).toLocaleDateString()}
                                                                        </p>
                                                                    </div>
                                                                    {!complaint.isRead && (
                                                                        <span className="flex-shrink-0 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                                                                            NEW
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            ) : (
                                                // Student view: filter by tab
                                                <div className=" divide-gray-100">
                                                    {complaints
                                                        .filter((c: any) => {
                                                            const hasStatusUpdate = c.status !== 'submitted' && c.status !== 'resolved';
                                                            if (notificationTab === 'unread') {
                                                                return hasStatusUpdate && !c.isRead;
                                                            }
                                                            return hasStatusUpdate;
                                                        })
                                                        .slice(0, 5)
                                                        .map((complaint: any) => {
                                                            const statusConfig: Record<string, { bg: string; icon: React.ReactElement; label: string }> = {
                                                                'in_review': {
                                                                    bg: 'bg-gray-100',
                                                                    icon: <Clock className="h-4 w-4 text-amber-600" />,
                                                                    label: 'In Review'
                                                                },
                                                                'need_clarification': {
                                                                    bg: 'bg-gray-100',
                                                                    icon: <MessageSquare className="h-4 w-4 text-purple-600" />,
                                                                    label: 'Needs Clarity'
                                                                },
                                                                'assigned': {
                                                                    bg: 'bg-gray-100',
                                                                    icon: <AlertCircle className="h-4 w-4 text-blue-600" />,
                                                                    label: 'Assigned'
                                                                },
                                                                'escalated': {
                                                                    bg: 'bg-gray-100',
                                                                    icon: <Zap className="h-4 w-4 text-red-600" />,
                                                                    label: 'Escalated'
                                                                },
                                                            };
                                                            const config = statusConfig[complaint.status] || {
                                                                bg: 'bg-gray-100',
                                                                icon: <MessageSquare className="h-4 w-4 text-gray-600" />,
                                                                label: complaint.status
                                                            };

                                                            return (
                                                                <div
                                                                    key={complaint._id}
                                                                    className={`px-5 py-3 hover:bg-blue-50 cursor-pointer transition-colors ${!complaint.isRead ? 'bg-blue-50' : 'bg-white'
                                                                        }`}
                                                                    onClick={() => handleComplaintClick(complaint._id, `/complaint/${complaint._id}`)}
                                                                >
                                                                    <div className="flex gap-3 items-start">
                                                                        {!complaint.isRead && (
                                                                            <div className="flex-shrink-0 mt-0.5">
                                                                                <div className="h-2 w-2 rounded-full bg-blue-600 mt-1" />
                                                                            </div>
                                                                        )}
                                                                        <div className="flex items-center justify-between w-full">
                                                                            <div className="flex items-center gap-2 truncate">
                                                                                <p className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">
                                                                                    {complaint.title}
                                                                                </p>
                                                                                <span
                                                                                    className={`text-[11px] font-medium text-gray-700 px-2 py-0.5 rounded ${config.bg}`}
                                                                                >
                                                                                    {config.label}
                                                                                </span>
                                                                            </div>
                                                                            <span className="text-[11px] text-gray-400 whitespace-nowrap">
                                                                                {new Date(complaint.updatedAt || complaint.createdAt).toLocaleString("en-IN", {
                                                                                    day: "2-digit",
                                                                                    month: "2-digit",
                                                                                    year: "numeric",
                                                                                    hour: "2-digit",
                                                                                    minute: "2-digit",
                                                                                    hour12: true,
                                                                                })}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        {/* {complaints.length > 0 && (
                                            <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                                                <Button
                                                    onClick={() => navigate(
                                                        user?.role === 'faculty'
                                                            ? '/faculty-dashboard'
                                                            : '/student-dashboard'
                                                    )}
                                                    className="w-full bg-gray-300 hover:bg-gray-400 text-black font-medium text-sm h-9 rounded-lg"
                                                >
                                                    View All
                                                </Button>
                                            </div>
                                        )} */}
                                    </PopoverContent>
                                </Popover>

                                <DropdownMenu>
                                    <div className="flex items-center justify-center p-1 rounded-3xl bg-card">
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                                <Avatar className="relative h-10 w-10 rounded-full hover:bg-transparent focus:bg-transparent">
                                                    <AvatarImage src={user?.profilePicture} alt={user?.name} />
                                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                                        {getInitials(user?.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <span className="ml-2 font-medium hidden sm:inline text-gray-500">{user?.name}</span>
                                    </div>
                                    <DropdownMenuContent className="w-56 z-50" align="end" forceMount>
                                        <div className="flex items-center w-full p-2 font-vend">
                                            <Avatar className="relative h-10 w-10 rounded-full">
                                                <AvatarImage src={user?.profilePicture} alt={user?.name} />
                                                <AvatarFallback className="bg-primary text-primary-foreground">
                                                    {getInitials(user?.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <p className="text-sm ml-2">
                                                {user?.name}
                                            </p>
                                            <p className="text-sm text-pink-500 capitalize ml-auto">
                                                {user?.role}
                                            </p>
                                        </div>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            asChild
                                            className="px-2 py-1 rounded-md transition-colors duration-150 
                data-[highlighted]:bg-gray-100 data-[highlighted]:text-black"
                                        >
                                            {/* ✅ Fixed here */}
                                            <Link to="/profile" className="flex items-center font-vend cursor-pointer">
                                                <User className="mr-0 h-4 w-4" />
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            asChild
                                            className="px-2 py-1 rounded-md transition-colors duration-150 
                data-[highlighted]:bg-gray-100 data-[highlighted]:text-black"
                                        ><Link to="/profile" className="flex items-center font-vend cursor-pointer">
                                                <User className="mr-0 h-4 w-4" />
                                                Get help
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            asChild
                                            className="px-2 py-1 rounded-md transition-colors duration-150 
                data-[highlighted]:bg-gray-100 data-[highlighted]:text-black"
                                        ><Link to="/profile" className="flex items-center font-vend cursor-pointer">
                                                <User className="mr-0 h-4 w-4" />
                                                Help center
                                            </Link>
                                        </DropdownMenuItem>
                                        {user?.role === 'admin' && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    asChild
                                                    className="px-2 py-1 rounded-md transition-colors duration-150 data-[highlighted]:bg-gray-100 data-[highlighted]:text-black"
                                                >
                                                    <Link to="/admin-dashboard" className="flex items-center font-vend">
                                                        <User className="mr-0 h-4 w-4" />
                                                        Admin Panel
                                                    </Link>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="flex items-center text-destructive px-2 py-1 rounded-md 
                transition-colors duration-150 data-[highlighted]:bg-gray-100 data-[highlighted]:text-red-600 font-vend"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="mr-0 h-4 w-4" />
                                            Log out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* <Button
                                variant="ghost"
                                size="lg"
                                onClick={toggleTheme}
                                className="h-12 w-12 p-0"
                            >
                                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </Button> */}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Button variant="ghost" asChild>
                                    <Link to="/login">Login</Link>
                                </Button>
                                <Button asChild>
                                    <Link to="/signup">Sign Up</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
