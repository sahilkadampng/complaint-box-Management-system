import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const { login } = useAuth();
    const { addNotification } = useNotification();
    const navigate = useNavigate();

    const [selectedRole, setSelectedRole] = useState<'student' | 'faculty' | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.username.trim() || !formData.password.trim()) {
            addNotification({
                type: 'error',
                message: 'Please fill in all fields'
            });
            return;
        }

        if (!selectedRole) {
            addNotification({
                type: 'error',
                message: 'Please select a role first'
            });
            return;
        }

        setIsLoading(true);

        try {
            // Get users from localStorage
            const users = JSON.parse(localStorage.getItem("users") || "[]");
            const user = users.find(
                (u: any) =>
                    u.username === formData.username.trim() &&
                    u.password === formData.password
            );

            if (!user) {
                addNotification({
                    type: 'error',
                    message: 'Invalid username or password'
                });
                return;
            }

            // ✅ Role restriction check
            if (user.role !== selectedRole) {
                addNotification({
                    type: 'error',
                    message: `Account is registered as ${user.role}`
                });
                return;
            }

            // If all good → log in
            const success = login(formData.username.trim(), formData.password, selectedRole);

            if (success) {
                addNotification({
                    type: 'success',
                    message: 'Login successful!'
                });
                navigate(selectedRole === 'student' ? '/student-dashboard' : '/faculty-dashboard');
            } else {
                addNotification({
                    type: 'error',
                    message: 'Login failed. Please try again.'
                });
            }
        } catch (error) {
            addNotification({
                type: 'error',
                message: 'Login failed. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-secondary p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">
                        <img src='https://acs.dypdpuerp.in/assets/images/DYPDPUUnitechsocietylogo1.png' width="1000px" height="50px" alt='logo' className='inline mr-2' />
                    </h1>
                    <p className="text-muted-foreground">
                        {!selectedRole ? 'Select your role to continue' : `Sign in as ${selectedRole}`}
                    </p>
                </div>

                {/* Role Selection or Login Form */}
                <Card className="shadow-hover">
                    <CardHeader>
                        <CardTitle className="text-center text-xl">
                            {!selectedRole ? 'Choose Your Role' : 'Login'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!selectedRole ? (
                            /* Role Selection */
                            <div className="space-y-4">
                                <Button
                                    onClick={() => setSelectedRole('student')}
                                    className="w-full hover:bg-sky-700 transition-colors duration-200 bg-sky-500 font-arial"
                                    size="lg"
                                >
                                    Student Login
                                </Button>
                                <Button
                                    onClick={() => setSelectedRole('faculty')}
                                    variant="secondary"
                                    className="w-full hover:bg-sky-700 transition-colors duration-200 bg-sky-500"
                                    size="lg"
                                >
                                    Faculty Login
                                </Button>
                            </div>
                        ) : (
                            /* Login Form */
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="text-sm text-muted-foreground">
                                        Logging in as: <span className="font-medium capitalize">{selectedRole}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedRole(null)}
                                        className="text-white hover:text-primary-dark bg-sky-500"
                                    >
                                        Change Role
                                    </Button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Username</Label>
                                        <Input
                                            id="username"
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => handleInputChange('username', e.target.value)}
                                            placeholder="Enter your username"
                                            required
                                            className="transition-all duration-200 focus:shadow-hover"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => handleInputChange('password', e.target.value)}
                                            placeholder="Enter your password"
                                            required
                                            className="transition-all duration-200 focus:shadow-hover"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-sky-500 hover:shadow-hover transition-all duration-200"
                                    >
                                        {isLoading ? 'Signing in...' : 'Sign In'}
                                    </Button>
                                </form>
                            </div>
                        )}

                        {!selectedRole && (
                            <div className="mt-6 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Don't have an account?{' '}
                                    <Link
                                        to="/signup"
                                        className="text-primary hover:text-primary-dark font-medium transition-colors"
                                    >
                                        Sign up here
                                    </Link>
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Login;
