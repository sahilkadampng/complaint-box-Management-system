import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users } from 'lucide-react';

const RoleSelection: React.FC = () => {
    const { setUserRole, user } = useAuth();
    const { addNotification } = useNotification();
    const navigate = useNavigate();

    const handleRoleSelection = (role: 'student' | 'faculty') => {
        setUserRole(role);
        addNotification({
            type: 'success',
            message: `Welcome ${user?.name}! You're logged in as ${role}.`
        });

        if (role === 'student') {
            navigate('/student-dashboard');
        } else {
            navigate('/faculty-dashboard');
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-secondary p-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">
                        Welcome, {user?.name}!
                    </h1>
                    <p className="text-muted-foreground">
                        Please select your role to continue
                    </p>
                </div>

                {/* Role Selection Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Student Role */}
                    <Card className="shadow-hover hover:shadow-card transition-all duration-300 cursor-pointer group"
                        onClick={() => handleRoleSelection('student')}>
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                                <GraduationCap className="h-12 w-12 text-primary" />
                            </div>
                            <CardTitle className="text-xl">Student</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-muted-foreground mb-6">
                                Submit and manage your complaints, track their status, and edit pending issues.
                            </p>
                            <div className="space-y-2 text-sm text-left">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    <span>Submit new complaints</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    <span>View complaint status</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    <span>Edit pending complaints</span>
                                </div>
                            </div>
                            <Button className="w-full mt-6 bg-gradient-primary hover:shadow-hover transition-all duration-200">
                                Continue as Student
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Faculty Role */}
                    <Card className="shadow-hover hover:shadow-card transition-all duration-300 cursor-pointer group"
                        onClick={() => handleRoleSelection('faculty')}>
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto mb-4 p-4 bg-secondary/10 rounded-full group-hover:bg-secondary/20 transition-colors">
                                <Users className="h-12 w-12 text-secondary" />
                            </div>
                            <CardTitle className="text-xl">Faculty</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-muted-foreground mb-6">
                                Review and manage all student complaints, update their status, and export reports.
                            </p>
                            <div className="space-y-2 text-sm text-left">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                                    <span>View all complaints</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                                    <span>Update complaint status</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                                    <span>Export PDF reports</span>
                                </div>
                            </div>
                            <Button
                                variant="secondary"
                                className="w-full mt-6 hover:shadow-hover transition-all duration-200"
                            >
                                Continue as Faculty
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Info */}
                <div className="text-center mt-8">
                    <p className="text-xs text-muted-foreground">
                        You can change your role anytime by logging out and logging back in.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;