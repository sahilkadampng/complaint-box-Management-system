import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import FacultyLayout from '@/components/FacultyLayout';

const FacultySignup: React.FC = () => {
    const { signup, user } = useAuth();
    const { addNotification } = useNotification();
    const navigate = useNavigate();

    // Redirect if not a faculty member
    React.useEffect(() => {
        if (user && user.role !== 'faculty') {
            addNotification({
                type: 'error',
                message: 'Access denied. Only faculty members can register new faculty.'
            });
            navigate('/');
        }
    }, [user, navigate, addNotification]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        department: '',
        section: '',
        phoneNumber: '',
        program: ''
    });

    const departmentPrograms: Record<string, string[]> = {
        'Computer Science': ['BSc CA', 'BBA CA', 'MSc CS'],
        'Electronics': ['Diploma Electronics', 'B.Tech Electronics'],
        'Mechanical': ['Diploma Mechanical', 'B.Tech Mechanical'],
        'Civil': ['Diploma Civil', 'B.Tech Civil'],
        'Chemical': ['Diploma Chemical', 'B.Tech Chemical'],
        'Business': ['BBA', 'MBA', 'BCom'],
        'Arts': ['BA English', 'BA History', 'BA Psychology']
    };

    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        confirm: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim() || !formData.email.trim() || !formData.username.trim() || !formData.password) {
            addNotification({
                type: 'error',
                message: 'Please fill in all required fields'
            });
            return;
        }

        if (!formData.department || !formData.program) {
            addNotification({
                type: 'error',
                message: 'Please select department and program'
            });
            return;
        }

        if (!formData.section.trim()) {
            addNotification({
                type: 'error',
                message: 'Please enter section'
            });
            return;
        }

        if (!agreedToTerms) {
            addNotification({
                type: 'error',
                message: 'Please agree to the Terms and Conditions'
            });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            addNotification({
                type: 'error',
                message: 'Passwords do not match'
            });
            return;
        }

        if (formData.password.length < 6) {
            addNotification({
                type: 'error',
                message: 'Password must be at least 6 characters long'
            });
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            addNotification({
                type: 'error',
                message: 'Please enter a valid email address'
            });
            return;
        }

        setIsLoading(true);

        try {
            const result = await signup({
                name: formData.name.trim(),
                email: formData.email.trim(),
                username: formData.username.trim(),
                password: formData.password,
                role: 'faculty',
                department: formData.department,
                section: formData.section.trim(),
                phoneNumber: formData.phoneNumber.trim(),
                program: formData.program,
                createdBy: user?.username || 'system',
                createdAt: new Date().toISOString()
            });

            if (result.success) {
                addNotification({
                    type: 'success',
                    message: 'Faculty account created successfully!'
                });
                
                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    username: '',
                    password: '',
                    confirmPassword: '',
                    department: '',
                    section: '',
                    phoneNumber: '',
                    program: ''
                });
                setAgreedToTerms(false);
            } else {
                addNotification({
                    type: 'error',
                    message: result.error || 'Faculty registration failed. Please check your information and try again.'
                });
            }
        } catch (error) {
            console.error('Faculty registration error:', error);
            addNotification({
                type: 'error',
                message: 'Registration failed. Please try again.'
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

    // Don't render if not faculty
    if (!user || user.role !== 'faculty') {
        return null;
    }

    return (
        <FacultyLayout>
            <div className="font-body flex w-full">
                <div className="max-w-2xl mx-auto px-6 py-8">
                    <Button 
                        className="bg-gray-100 hover:bg-gray-200 text-black shadow-sm mb-4 mt-20" 
                        onClick={() => navigate('/faculty-dashboard')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                    </Button>

                    <div className="text-center mb-8 px-0 py-8">
                        {/* <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Shield className="h-8 w-8 text-white" />
                        </div> */}
                        <h1 className="text-3xl font-bold text-foreground mb-2">Register New Faculty Member</h1>
                        <p className="text-muted-foreground">
                            Create a new faculty account for your institution
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm text-blue-700 dark:text-blue-300">
                                Faculty-only registration
                            </span>
                        </div>
                    </div>

                    <Card className="shadow-hover">
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                placeholder="Enter full name"
                                                required
                                                className="transition-all duration-200 focus:shadow-hover"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                placeholder="Enter email address"
                                                required
                                                className="transition-all duration-200 focus:shadow-hover"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="username">Username <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="username"
                                                type="text"
                                                value={formData.username}
                                                onChange={(e) => handleInputChange('username', e.target.value)}
                                                placeholder="Choose a username"
                                                required
                                                className="transition-all duration-200 focus:shadow-hover"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phoneNumber">Phone Number <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="phoneNumber"
                                                type="tel"
                                                value={formData.phoneNumber}
                                                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                                placeholder="Enter phone number"
                                                required
                                                className="transition-all duration-200 focus:shadow-hover"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showPasswords.current ? "text" : "password"}
                                                    value={formData.password}
                                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                                    placeholder="Create a strong password"
                                                    required
                                                    className="transition-all duration-200 focus:shadow-hover"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-black"
                                                    onClick={() =>
                                                        setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
                                                    }
                                                >
                                                    {showPasswords.current ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                                            <div className="relative">
                                                <Input
                                                    id="confirmPassword"
                                                    type={showPasswords.confirm ? "text" : "password"}
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                                    placeholder="Confirm your password"
                                                    required
                                                    className="transition-all duration-200 focus:shadow-hover"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-black"
                                                    onClick={() =>
                                                        setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                                                    }
                                                >
                                                    {showPasswords.confirm ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Faculty Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-4">Faculty Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="department">Department <span className="text-red-500">*</span></Label>
                                            <Select
                                                value={formData.department}
                                                onValueChange={(value) => {
                                                    handleInputChange('department', value);
                                                    handleInputChange('program', '');
                                                }}
                                            >
                                                <SelectTrigger className="transition-all duration-200 focus:shadow-hover">
                                                    <SelectValue placeholder="Select Department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.keys(departmentPrograms).map((dept) => (
                                                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {formData.department && (
                                            <div className="space-y-2">
                                                <Label htmlFor="program">Program <span className="text-red-500">*</span></Label>
                                                <Select
                                                    value={formData.program}
                                                    onValueChange={(value) => handleInputChange('program', value)}
                                                >
                                                    <SelectTrigger className="transition-all duration-200 focus:shadow-hover">
                                                        <SelectValue placeholder="Select Program" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {departmentPrograms[formData.department].map((prog) => (
                                                            <SelectItem key={prog} value={prog}>{prog}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="section">Section <span className="text-red-500">*</span></Label>
                                            <Input
                                                id="section"
                                                type="text"
                                                value={formData.section}
                                                onChange={(e) => handleInputChange('section', e.target.value)}
                                                placeholder="Enter section (e.g., A, B)"
                                                required
                                                className="transition-all duration-200 focus:shadow-hover"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Terms and Conditions */}
                                <div className="flex items-start space-x-3">
                                    <Checkbox
                                        id="terms"
                                        checked={agreedToTerms}
                                        onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                                        className="mt-1"
                                    />
                                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                                        I confirm that I have the authority to create this faculty account and agree to the{' '}
                                        <Link to="/faculty-dashboard/terms" className="text-primary hover:text-primary-dark font-medium">
                                            Terms and Conditions
                                        </Link>
                                        {' '}and{' '}
                                        <Link to="/faculty-dashboard/privacy" className="text-primary hover:text-primary-dark font-medium">
                                            Privacy Policy
                                        </Link>
                                        .
                                    </Label>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-blue-500 hover:bg-blue-600 transition-all duration-200 text-lg py-6"
                                >
                                    {isLoading ? 'Creating Faculty Account...' : 'Create Faculty Account'}
                                </Button>
                            </form>

                            {/* Help Section */}
                            <div className="mt-8 pt-6 border-t border-border">
                                <div className="text-center">
                                    <h4 className="text-sm font-medium text-foreground mb-2">Need Help?</h4>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        If you're having trouble creating a faculty account, please contact the system administrator.
                                    </p>
                                    <div className="flex justify-center space-x-6 text-sm">
                                        <Link to="#" className="text-primary hover:text-primary-dark flex items-center space-x-1">
                                            <span>📧</span>
                                            <span>admin@college.edu</span>
                                        </Link>
                                        <Link to="#" className="text-primary hover:text-primary-dark flex items-center space-x-1">
                                            <span>📞</span>
                                            <span>+91 98765 4320</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </FacultyLayout>
    );
};

export default FacultySignup;
