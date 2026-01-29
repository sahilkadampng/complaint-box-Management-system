import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '@/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mail, Lock, ArrowLeft, Shield } from 'lucide-react';
import { apiClient } from '@/lib/api';
import dpuImg from '@/assets/DYPDPUUnitechsocietylogo1.png';

export default function AdminLogin() {
    const { addNotification } = useNotification();
    const navigate = useNavigate();

    const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            addNotification({ type: 'error', message: 'Please enter your email' });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            addNotification({ type: 'error', message: 'Please enter a valid email address' });
            return;
        }

        setIsLoading(true);

        try {
            const response = await apiClient.patch('/auth/admin/send-code', { email });
            
            if (response.data) {
                addNotification({
                    type: 'success',
                    message: 'Verification code sent to your email'
                });
                setStep('code');
            } else {
                addNotification({
                    type: 'error',
                    message: response.error || 'Failed to send verification code'
                });
            }
        } catch (error) {
            addNotification({
                type: 'error',
                message: 'Failed to send verification code. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!verificationCode.trim()) {
            addNotification({ type: 'error', message: 'Please enter the verification code' });
            return;
        }

        setIsLoading(true);

        try {
            const response = await apiClient.patch('/auth/admin/verify-code', {
                email,
                code: verificationCode
            });

            if (response.data) {
                addNotification({
                    type: 'success',
                    message: 'Code verified! Please enter your password'
                });
                setStep('password');
            } else {
                addNotification({
                    type: 'error',
                    message: response.error || 'Invalid verification code'
                });
            }
        } catch (error) {
            addNotification({
                type: 'error',
                message: 'Invalid verification code. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password.trim()) {
            addNotification({ type: 'error', message: 'Please enter your password' });
            return;
        }

        setIsLoading(true);

        try {
            // Use admin-specific login endpoint with email
            const response = await apiClient.post('/auth/admin/login', {
                email,
                password
            });

            if (response.data && response.data.token) {
                // Store token and user data
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                addNotification({
                    type: 'success',
                    message: 'Welcome back, Admin!'
                });
                
                // Reload to update auth context
                window.location.href = '/admin-dashboard';
            } else {
                addNotification({
                    type: 'error',
                    message: 'Invalid credentials'
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

    return (
        <div className="font-body">
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 p-4">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <img
                            src={dpuImg}
                            width="200"
                            height="50"
                            alt="logo"
                            className="mx-auto mb-4"
                        />
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Shield className="h-6 w-6 text-red-600" />
                            <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
                        </div>
                        <p className="text-gray-600">Secure authentication required</p>
                    </div>

                    <Card className="shadow-xl border-red-100">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl text-gray-900">
                                        {step === 'email' && 'Verify Your Identity'}
                                        {step === 'code' && 'Enter Verification Code'}
                                        {step === 'password' && 'Enter Password'}
                                    </CardTitle>
                                    <CardDescription>
                                        {step === 'email' && 'Enter your admin email to receive verification code'}
                                        {step === 'code' && 'Check your email for the 6-digit code'}
                                        {step === 'password' && 'Enter your admin password to continue'}
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate('/login')}
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Back
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {/* Step 1: Email */}
                            {step === 'email' && (
                                <form onSubmit={handleSendCode} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-gray-700">
                                            Admin Email Address
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="admin@example.com"
                                                className="pl-10 h-11"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-red-600 hover:bg-red-700 h-11 text-white font-medium"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Sending...' : 'Send Verification Code'}
                                    </Button>
                                </form>
                            )}

                            {/* Step 2: Verification Code */}
                            {step === 'code' && (
                                <form onSubmit={handleVerifyCode} className="space-y-6">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                        <p className="text-sm text-blue-800">
                                            A 6-digit verification code has been sent to{' '}
                                            <span className="font-semibold">{email}</span>
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="code" className="text-gray-700">
                                            Verification Code
                                        </Label>
                                        <Input
                                            id="code"
                                            type="text"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            placeholder="Enter 6-digit code"
                                            maxLength={6}
                                            className="h-11 text-center text-2xl tracking-widest"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => setStep('email')}
                                            disabled={isLoading}
                                        >
                                            Change Email
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Verifying...' : 'Verify Code'}
                                        </Button>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="link"
                                        className="w-full text-sm text-gray-600"
                                        onClick={handleSendCode}
                                        disabled={isLoading}
                                    >
                                        Didn't receive code? Resend
                                    </Button>
                                </form>
                            )}

                            {/* Step 3: Password */}
                            {step === 'password' && (
                                <form onSubmit={handleLogin} className="space-y-6">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                        <p className="text-sm text-green-800">
                                            ✓ Email verified successfully
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-gray-700">
                                            Admin Password
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                className="pl-10 h-11"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-red-600 hover:bg-red-700 h-11 text-white font-medium"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Signing in...' : 'Sign In'}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>

                    {/* Security Notice */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            <Shield className="h-3 w-3 inline mr-1" />
                            This is a secure admin portal. All login attempts are monitored.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
