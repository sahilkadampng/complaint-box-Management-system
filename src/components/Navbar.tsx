import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
// import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { LogOut, User } from 'lucide-react';
import dpuImg from '@/assets/DYPDPUUnitechsocietylogo1.png';

const Navbar: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    // const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getInitials = (name?: string | null) => {
        if (!name) return 'U';
        const parts = name.trim().split(/\s+/);
        const first = parts[0]?.[0] ?? '';
        const second = parts[1]?.[0] ?? '';
        const initials = `${first}${second}`.toUpperCase();
        return initials || 'U';
    };

    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    React.useEffect(() => {
        const handler = () => setSidebarOpen(prev => !prev);
        window.addEventListener("toggleSidebar", handler);
        return () => window.removeEventListener("toggleSidebar", handler);
    }, []);


    return (
        <div className="font-vend">
            <nav className="fixed top-0 z-50 w-full border-b border-border bg-card/70 backdrop-blur shadow-card">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            {/*  Mobile Hamburger Button */}
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
                                    ></span>
                                    <span
                                        className={`
                block h-[3px] w-7 bg-gray-800 rounded my-[6px] transition-all duration-0
                ${sidebarOpen ? "opacity-0 bg-white" : ""}
            `}
                                    ></span>
                                    <span
                                        className={`
                block h-[3px] w-7 bg-gray-800 rounded transition-all duration-300
                ${sidebarOpen ? "-rotate-45 -translate-y-[8px] w-8" : ""}
            `}
                                    ></span>
                                </button>
                            </div>
                            <Link to="/" className="flex items-center space-x-2">
                                <img
                                    src={dpuImg}
                                    width={90}
                                    height={90}
                                    alt="logo"
                                    className="inline ml-5"
                                />
                            </Link>
                        </div>

                        {isAuthenticated && user ? (
                            <div className="flex items-center space-x-4">
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
                                        <div className="flex items-center justify-start gap-2 p-2 font-vend">
                                            <div className="flex flex-col space-y-1 leading-none">
                                                <p className="font-medium">{user?.name}</p>
                                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                                                <p className="text-xs text-primary capitalize">{user?.role}</p>
                                            </div>
                                        </div>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            asChild
                                            className="px-2 py-1 rounded-md transition-colors duration-150 
                data-[highlighted]:bg-gray-100 data-[highlighted]:text-black"
                                        >
                                            {/* ✅ Fixed here */}
                                            <Link to="/profile" className="flex items-center font-vend">
                                                <User className="mr-0 h-4 w-4" />
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>
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