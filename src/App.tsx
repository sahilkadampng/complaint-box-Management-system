import React from 'react';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { NetworkProvider } from "@/context/NetworkContext";
import Notification from "@/components/Notification";
import Index from "./pages/basic";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import RegisterUserPage from "./pages/register";
import Signup from "./pages/Signup";
import RoleSelection from "./pages/RoleSelection";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
// import FacultyProfile from "./pages/FacultyProfile";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from './pages/Profile';
import ViewStudentsPage from "./pages/ViewStudentsPage";
import ViewFacultyPage from "./pages/ViewFacultyPage";
import NotFound from "./pages/NotFound";
import { LoaderProvider } from "@/context/LoaderContext";
import Settings from "./pages/setting";
import AnalyticsPage from "./pages/AnalyticsPage";
import StudentAnalyticsPage from "./pages/StudentAnalyticsPage";
import HelpPage from "./pages/HelpPage";
import ReportsPage from "./pages/ReportsPage";
import StudentReportsPage from "./pages/StudentReportsPage";
import ComplaintDetails from "./pages/ComplaintDetails";
import UserManagementPage from "./pages/UserManagementPage";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";



const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireRole?: boolean }> = ({
    children,
    requireRole = false
}) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requireRole && !user?.role) {
        return <Navigate to="/role-selection" replace />;
    }

    return <>{children}</>;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();

    if (isAuthenticated && user?.role) {
        if (user.role === 'student') {
            return <Navigate to="/student-dashboard" replace />;
        } else if (user.role === 'faculty') {
            return <Navigate to="/faculty-dashboard" replace />;
        } else if (user.role === 'admin') {
            return <Navigate to="/admin-dashboard" replace />;
        }
    }

    return <>{children}</>;
};

const App = () => {
    console.log("App component rendered");

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <AuthProvider>
                    <NotificationProvider>
                        <TooltipProvider>
                            <NetworkProvider>
                                <Sonner />
                                <Notification />
                                <BrowserRouter>
                                    <LoaderProvider>
                                        <Routes>
                                            {/* Public Routes */}
                                            <Route path="/" element={
                                                <PublicRoute>
                                                    <Index />
                                                </PublicRoute>
                                            } />
                                            <Route path="/login" element={
                                                <PublicRoute>
                                                    <Login />
                                                </PublicRoute>
                                            } />
                                            <Route path="/admin-login" element={
                                                <PublicRoute>
                                                    <AdminLogin />
                                                </PublicRoute>
                                            } />
                                            <Route path="/signup" element={
                                                <PublicRoute>
                                                    <Signup />
                                                </PublicRoute>
                                            } />
                                            <Route path="/role-selection" element={
                                                <ProtectedRoute>
                                                    <RoleSelection />
                                                </ProtectedRoute>
                                            } />
                                            <Route path="/student/dashboard" element={
                                                <ProtectedRoute requireRole>
                                                    <StudentDashboard />
                                                </ProtectedRoute>
                                            } />
                                            <Route path="/faculty-dashboard" element={
                                                <ProtectedRoute requireRole>
                                                    <FacultyDashboard />
                                                </ProtectedRoute>
                                            }>
                                                {/* <Route path="profile" element={<FacultyProfile />} /> */}
                                                <Route path="view-students" element={<ViewStudentsPage />} />
                                                <Route path="view-faculty" element={<ViewFacultyPage />} />
                                                <Route path="help" element={<HelpPage />} />
                                                <Route path="ReportsPage" element={<ReportsPage />} />
                                                <Route path="complaint/:id" element={<ComplaintDetails />} />
                                                <Route path="UserManagementPage" element={<UserManagementPage />} />
                                                <Route path="terms" element={<Terms />} />
                                                <Route path="privacy" element={<Privacy />} />
                                                <Route path="settings" element={
                                                    <ProtectedRoute>
                                                        <Settings />
                                                    </ProtectedRoute>
                                                } />
                                                <Route path="register" element={
                                                    <ProtectedRoute>
                                                        <RegisterUserPage />
                                                    </ProtectedRoute>
                                                } />
                                                <Route path="AnalyticsPage" element={
                                                    <ProtectedRoute>
                                                        <AnalyticsPage />
                                                    </ProtectedRoute>
                                                } />
                                            </Route>
                                            <Route path="/student/analytics" element={
                                                <ProtectedRoute requireRole>
                                                    <StudentAnalyticsPage />
                                                </ProtectedRoute>
                                            } />
                                            <Route path="/student/reports" element={
                                                <ProtectedRoute requireRole>
                                                    <StudentReportsPage />
                                                </ProtectedRoute>
                                            } />
                                            <Route path="/profile" element={
                                                <ProtectedRoute>
                                                    <Profile />
                                                </ProtectedRoute>
                                            } />
                                            <Route path="/admin-dashboard" element={
                                                <ProtectedRoute requireRole>
                                                    <AdminDashboard />
                                                </ProtectedRoute>
                                            } />
                                            <Route path="/complaint/:id" element={
                                                <ProtectedRoute requireRole>
                                                    <ComplaintDetails />
                                                </ProtectedRoute>
                                            } />
                                            <Route path="/student-dashboard" element={
                                                <ProtectedRoute requireRole>
                                                    <StudentDashboard />
                                                </ProtectedRoute>
                                            } />
                                            {/* Catch-all route */}
                                            <Route path="*" element={<NotFound />} />
                                        </Routes>
                                    </LoaderProvider>
                                </BrowserRouter>
                            </NetworkProvider>
                        </TooltipProvider>
                    </NotificationProvider>
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
};

export default App;