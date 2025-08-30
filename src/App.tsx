import React from 'react';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { NotificationProvider } from "@/context/NotificationContext";
import Notification from "@/components/Notification";
import Index from "./pages/Index";
import Login from "./pages/Login";
import RegisterUserPage from "./pages/register";
import Signup from "./pages/Signup";
import RoleSelection from "./pages/RoleSelection";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import Profile from './pages/Profile';
import NotFound from "./pages/NotFound";

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
    return <Navigate to={user.role === 'student' ? '/student-dashboard' : '/faculty-dashboard'} replace />;
  }

  return <>{children}</>;
};

const App = () => {
  // Initialize demo users on first load
  React.useEffect(() => {
    const existingUsers = localStorage.getItem('users');
    if (!existingUsers) {
      const demoUsers = [
        {
          id: '1',
          name: 'Demo Student',
          username: 'student',
          email: 'student@college.edu',
          password: 'password'
        },
        {
          id: '2',
          name: 'Demo Faculty',
          username: 'faculty',
          email: 'faculty@college.edu',
          password: 'password'
        }
      ];
      localStorage.setItem('users', JSON.stringify(demoUsers));
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <TooltipProvider>
              <Sonner />
              <Notification />
              <BrowserRouter>
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
                  <Route path="/signup" element={
                    <PublicRoute>
                      <Signup />
                    </PublicRoute>
                  } />
                  <Route path="/register" element={
                    <ProtectedRoute>
                      <RegisterUserPage />
                    </ProtectedRoute>
                  } />
                  {/* Protected Routes */}
                  {/* Protected Routes */}
                  <Route path="/role-selection" element={
                    <ProtectedRoute>
                      <RoleSelection />
                    </ProtectedRoute>
                  } />
                  <Route path="/student-dashboard" element={
                    <ProtectedRoute requireRole>
                      <StudentDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/faculty-dashboard" element={
                    <ProtectedRoute requireRole>
                      <FacultyDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;