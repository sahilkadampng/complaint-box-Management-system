import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Users, } from 'lucide-react';
import { Eye, EyeOff } from 'lucide-react';
import topLeftImg from '@/assets/8094458.jpg'
import midRightImg from '@/assets/Secure login-rafiki.png'
import bottomLeftImg from '@/assets/undraw_mobile-encryption_flk2.svg'

const Signup: React.FC = () => {
    const { signup } = useAuth();
    const { addNotification } = useNotification();
    const navigate = useNavigate();

    const [selectedRole, setSelectedRole] = useState<'student' | 'faculty' | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        studentId: '',
        rollNumber: '',
        department: '',
        yearOfStudy: '',
        phoneNumber: '',
        program: ''
    });

    const departmentPrograms: Record<string, string[]> = {
        "Computer Science": ["BSc CA", "BBA CA", "MSc CS"],
        "Electronics": ["Diploma Electronics", "B.Tech Electronics"],
        "Mechanical": ["Diploma Mechanical", "B.Tech Mechanical"],
        "Civil": ["Diploma Civil", "B.Tech Civil"],
        "Chemical": ["Diploma Chemical", "B.Tech Chemical"],
        "Business": ["BBA", "MBA", "BCom"],
        "Arts": ["BA English", "BA History", "BA Psychology"]
    };


    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!selectedRole) {
            addNotification({
                type: 'error',
                message: 'Please select your role'
            });
            return;
        }

        if (!formData.name.trim() || !formData.email.trim() || !formData.username.trim() || !formData.password) {
            addNotification({
                type: 'error',
                message: 'Please fill in all required fields'
            });
            return;
        }

        // if (!formData.studentId.trim() || !formData.rollNumber.trim() || !formData.department || !formData.yearOfStudy || !formData.phoneNumber.trim() || !formData.program) {
        //     addNotification({
        //         type: 'error',
        //         message: 'Please fill in all student information fields including Program'
        //     });
        //     return;
        // }

        if (selectedRole === 'student') {
            if (!formData.studentId.trim() || !formData.rollNumber.trim() || !formData.department || !formData.yearOfStudy || !formData.phoneNumber.trim()) {
                addNotification({
                    type: 'error',
                    message: 'Please fill in all student information fields'
                });
                return;
            }
        }

        if (selectedRole === 'faculty') {
            if (!formData.name.trim() || !formData.email.trim() || !formData.username.trim() || !formData.password) {
                addNotification({
                    type: 'error',
                    message: 'Please fill in all student information fields'
                });
                return;
            }
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
                role: selectedRole!,
                department: formData.department,
                yearOfStudy: formData.yearOfStudy,
                studentId: formData.studentId,
                rollNumber: formData.rollNumber,
                phoneNumber: formData.phoneNumber,
                program: formData.program
            });
            if (result.success) {
                addNotification({
                    type: 'success',
                    message: 'Account created successfully! Redirecting...'
                });
                setTimeout(() => {
                    navigate(selectedRole === 'student' ? '/student-dashboard' : '/faculty-dashboard');
                }, 1000);
            } else {
                addNotification({
                    type: 'error',
                    message: result.error || 'Signup failed. Please check your information and try again.'
                });
            }
        } catch (error) {
            console.error('Signup error:', error);
            addNotification({
                type: 'error',
                message: 'Signup failed. Please try again.'
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

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    return (
        <div className="font-vend">
            <div className="min-h-screen relative bg-gradient-secondary">
                <img
                    src={topLeftImg}
                    alt="Decoration Top Left"
                    className="hidden md:block absolute top-10 left-0 rounded-lg"
                    width={550}
                    height={350}
                />

                {/* Mid Right */}
                <img
                    src={midRightImg}
                    alt="Decoration Mid Right"
                    className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 rounded-lg"
                    width={550}
                    height={350}
                />

                {/* Bottom Left */}
                <img
                    src={bottomLeftImg}
                    alt="Decoration Bottom Left"
                    className="hidden md:block absolute bottom-6 left-12 rounded-lg"
                    width={450}
                    height={300}
                />

                {/* Page Content */}

                <div className="relative z-10">
                    <div className="bg-sky-500 text-primary-foreground px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <img src='https://acs.dypdpuerp.in/assets/images/DYPDPUUnitechsocietylogo1.png' width="100px" height="50px" alt='logo' className='inline mr-2' />
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/login"
                                className="text-primary-foreground/90 hover:text-primary-foreground transition-colors rounded-md bg-sky-500 p-1"
                            >
                                Login
                            </Link>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="max-w-2xl mx-auto px-6 py-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                                <GraduationCap className="h-8 w-8 text-primary-foreground" />
                            </div>
                            <h2 className="text-3xl font-bold text-foreground mb-2">Create Your Account</h2>
                            <p className="text-muted-foreground">
                                Join College Complaint panel to submit your complaints
                            </p>
                        </div>

                        <Card className="shadow-hover bg-white/30 backdrop-blur-sm rounded-xl border border-white/20">
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
                                                    placeholder="Enter your full name"
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
                                                    placeholder="Enter your email address"
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
                                                <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                                                <div className="relative">
                                                    <Input
                                                        id="password"
                                                        type={showPasswords.current ? "text" : "password"}   // ✅ toggle type here
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
                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                                                <div className="relative">
                                                    <Input
                                                        id="confirmPassword"
                                                        type={showPasswords.confirm ? "text" : "password"}   // ✅ toggle confirm
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

                                    {/* Role Selection */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground mb-4">Select Your Role <span className="text-red-500">*</span></h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Card
                                                className={`cursor-pointer transition-all duration-200 ${selectedRole === 'student'
                                                    ? 'ring-2 ring-primary bg-primary/5'
                                                    : 'hover:shadow-hover'
                                                    }`}
                                                onClick={() => setSelectedRole('student')}
                                            >
                                                <CardContent className="p-6 text-center">
                                                    <GraduationCap className="h-8 w-8 text-primary mx-auto mb-3" />
                                                    <h4 className="font-semibold text-foreground mb-2">Student</h4>
                                                    <p className="text-sm text-muted-foreground">I am a student at this college</p>
                                                </CardContent>
                                            </Card>

                                            <Card
                                                className={`cursor-pointer transition-all duration-200 ${selectedRole === 'faculty'
                                                    ? 'ring-2 ring-primary bg-primary/5'
                                                    : 'hover:shadow-hover'
                                                    }`}
                                                onClick={() => setSelectedRole('faculty')}
                                            >
                                                <CardContent className="p-6 text-center">
                                                    <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                                                    <h4 className="font-semibold text-foreground mb-2">Faculty</h4>
                                                    <p className="text-sm text-muted-foreground">I am a faculty member or staff</p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>

                                    {/* Student Information */}
                                    {selectedRole === 'student' && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-foreground mb-4">Student Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="studentId">Student ID <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        id="studentId"
                                                        type="text"
                                                        value={formData.studentId}
                                                        onChange={(e) => handleInputChange('studentId', e.target.value)}
                                                        placeholder=""
                                                        required
                                                        className="transition-all duration-200 focus:shadow-hover"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="rollNumber">Roll Number <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        id="rollNumber"
                                                        type="text"
                                                        value={formData.rollNumber}
                                                        onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                                                        placeholder=""
                                                        required
                                                        className="transition-all duration-200 focus:shadow-hover"
                                                    />
                                                </div>

                                                {/* Department */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="department">Department <span className="text-red-500">*</span></Label>
                                                    <Select
                                                        value={formData.department}
                                                        onValueChange={(value) => {
                                                            handleInputChange('department', value);
                                                            handleInputChange('program', ''); // reset program when department changes
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

                                                {/* Program (shows only if department is selected) */}
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
                                                    <Label htmlFor="yearOfStudy">
                                                        Year of Study <span className="text-red-500">*</span>
                                                    </Label>

                                                    <Select value={formData.yearOfStudy} onValueChange={(value) => handleInputChange('yearOfStudy', value)}>
                                                        <SelectTrigger className="transition-all duration-200 focus:shadow-hover">
                                                            <SelectValue placeholder="Select Year" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="1st Year">1st Year</SelectItem>
                                                            <SelectItem value="2nd Year">2nd Year</SelectItem>
                                                            <SelectItem value="3rd Year">3rd Year</SelectItem>
                                                            <SelectItem value="4th Year">4th Year</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2 md:col-span-2">
                                                    <Label htmlFor="phoneNumber">Phone Number <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        id="phoneNumber"
                                                        type="tel"
                                                        value={formData.phoneNumber}
                                                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                                        placeholder=""
                                                        required
                                                        className="transition-all duration-200 focus:shadow-hover"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Terms and Conditions */}
                                    <div className="flex items-start space-x-3">
                                        <Checkbox
                                            id="terms"
                                            checked={agreedToTerms}
                                            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                                            className="mt-1"
                                        />
                                        <Label htmlFor="terms" className="text-sm leading-relaxed">
                                            I agree to the{' '}
                                            <Link to="/terms" className="text-primary hover:text-primary-dark font-medium">
                                                Terms and Conditions
                                            </Link>
                                            {' '}and{' '}
                                            <Link to="/privacy" className="text-primary hover:text-primary-dark font-medium">
                                                Privacy Policy
                                            </Link>
                                            . By creating an account, you agree to our Terms of Service and Privacy Policy.
                                        </Label>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-gradient-primary hover:shadow-hover transition-all duration-200 text-lg py-6 bg-sky-500"
                                    >
                                        {isLoading ? 'Creating Account...' : 'Create Account'}
                                    </Button>
                                </form>

                                <div className="mt-8 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Already have an account?{' '}
                                        <Link
                                            to="/login"
                                            className="text-primary hover:text-primary-dark font-medium transition-colors"
                                        >
                                            Sign in here
                                        </Link>
                                    </p>
                                </div>

                                {/* Help Section */}
                                <div className="mt-8 pt-6 border-t border-border">
                                    <div className="text-center">
                                        <h4 className="text-sm font-medium text-foreground mb-2">Need Help?</h4>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            If you're having trouble creating your account, please contact the college administration.
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
            </div>
        </div>
    );
};

export default Signup;