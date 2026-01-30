import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api';
import FacultyLayout from '@/components/FacultyLayout';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Camera,
    Save,
    Eye,
    EyeOff,
    Lock,
    User,
    AlertCircle,
    CheckCircle,
    Edit2,
    LogOut,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProfileFormData {
    name: string;
    email: string;
    phoneNumber?: string;
    department: string;
    section?: string;
}

interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const FacultyProfile: React.FC = () => {
    const { user: authUser, updateUser } = useAuth();
    const { addNotification } = useNotification();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile State
    const [profileData, setProfileData] = useState<ProfileFormData>({
        name: authUser?.name || '',
        email: authUser?.email || '',
        phoneNumber: authUser?.phoneNumber || '',
        department: authUser?.department || '',
        section: authUser?.section || '',
    });

    // Password State
    const [passwordData, setPasswordData] = useState<PasswordFormData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // UI State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingImage, setIsLoadingImage] = useState(false);
    const [showPasswordVisibility, setShowPasswordVisibility] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Initialize form data
    useEffect(() => {
        if (authUser) {
            setProfileData({
                name: authUser.name || '',
                email: authUser.email || '',
                phoneNumber: authUser.phoneNumber || '',
                department: authUser.department || '',
                section: authUser.section || '',
            });
        }
    }, [authUser]);

    const resetPasswordForm = () => {
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
    };

    // Validation Functions
    const validateProfileForm = (): boolean => {
        if (!profileData.name.trim()) {
            addNotification?.({ type: 'error', message: 'Name is required' });
            return false;
        }
        if (!profileData.email.trim()) {
            addNotification?.({ type: 'error', message: 'Email is required' });
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
            addNotification?.({ type: 'error', message: 'Invalid email format' });
            return false;
        }
        if (!profileData.department.trim()) {
            addNotification?.({ type: 'error', message: 'Department is required' });
            return false;
        }
        return true;
    };

    const validatePasswordForm = (): boolean => {
        if (!passwordData.currentPassword.trim()) {
            addNotification?.({ type: 'error', message: 'Current password is required' });
            return false;
        }
        if (!passwordData.newPassword.trim()) {
            addNotification?.({ type: 'error', message: 'New password is required' });
            return false;
        }
        if (passwordData.newPassword.length < 6) {
            addNotification?.({ type: 'error', message: 'New password must be at least 6 characters' });
            return false;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            addNotification?.({ type: 'error', message: 'Passwords do not match' });
            return false;
        }
        if (passwordData.currentPassword === passwordData.newPassword) {
            addNotification?.({ type: 'error', message: 'New password must be different from current password' });
            return false;
        }
        return true;
    };

    // Handle Profile Update
    const handleSaveProfile = async () => {
        if (!validateProfileForm()) return;

        setIsSaving(true);
        try {
            const response = await apiClient.updateProfile({
                name: profileData.name,
                email: profileData.email,
                phoneNumber: profileData.phoneNumber,
                department: profileData.department,
                section: profileData.section,
            });

            if (response.error) {
                addNotification?.({ type: 'error', message: response.error });
            } else if (response.data) {
                updateUser(response.data.user);
                setProfileData({
                    name: response.data.user.name || '',
                    email: response.data.user.email || '',
                    phoneNumber: response.data.user.phoneNumber || '',
                    department: response.data.user.department || '',
                    section: response.data.user.section || '',
                });
                setIsEditingProfile(false);
                addNotification?.({ type: 'success', message: 'Profile updated successfully!' });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            addNotification?.({ type: 'error', message: 'Failed to update profile' });
        } finally {
            setIsSaving(false);
        }
    };

    // Handle Password Change
    const handleChangePassword = async () => {
        if (!validatePasswordForm()) return;

        setIsSaving(true);
        try {
            const response = await apiClient.changePassword(
                passwordData.currentPassword,
                passwordData.newPassword
            );

            if (response.error) {
                addNotification?.({ type: 'error', message: response.error });
            } else {
                addNotification?.({ type: 'success', message: 'Password changed successfully!' });
                resetPasswordForm();
                setIsChangingPassword(false);
            }
        } catch (error) {
            console.error('Error changing password:', error);
            addNotification?.({ type: 'error', message: 'Failed to change password' });
        } finally {
            setIsSaving(false);
        }
    };

    // Avatar Upload
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            addNotification?.({ type: 'error', message: 'File size must be less than 5MB' });
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            addNotification?.({ type: 'error', message: 'Please select an image file' });
            return;
        }

        setIsLoadingImage(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('avatar', file);

            const response = await apiClient.uploadAvatar(formDataToSend);

            if (response.error) {
                addNotification?.({ type: 'error', message: response.error });
            } else if (response.data) {
                updateUser(response.data.user);
                addNotification?.({ type: 'success', message: 'Avatar updated successfully!' });
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            addNotification?.({ type: 'error', message: 'Failed to upload avatar' });
        } finally {
            setIsLoadingImage(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Handle Logout
    const handleLogout = () => {
        setShowLogoutConfirm(false);
        localStorage.removeItem('token');
        navigate('/faculty-login');
    };

    if (!authUser) {
        return (
            <FacultyLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <Card>
                        <CardContent className="p-8">
                            <p className="text-gray-600">Loading...</p>
                        </CardContent>
                    </Card>
                </div>
            </FacultyLayout>
        );
    }

    return (
        <FacultyLayout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="text-gray-600 mt-2">Manage your account information and security settings</p>
                </div>

                {/* Profile Overview Card */}
                <Card className="mb-8 bg-white shadow-lg border-0">
                    <CardHeader className="pb-6">
                        <div className="flex flex-col md:flex-row md:items-end gap-6">
                            {/* Avatar Section */}
                            <div className="relative">
                                <Avatar className="w-24 h-24 border-4 border-indigo-200">
                                    <AvatarImage src={authUser?.profilePicture} alt={authUser?.name} />
                                    <AvatarFallback className="bg-indigo-500 text-white text-xl font-semibold">
                                        {authUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <button
                                    onClick={handleAvatarClick}
                                    disabled={isLoadingImage}
                                    className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleAvatarChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900">{authUser?.name}</h2>
                                <p className="text-gray-600">{authUser?.department}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge className="bg-green-100 text-green-800">
                                        <span className="w-2 h-2 bg-green-600 rounded-full mr-2 inline-block"></span>
                                        Faculty
                                    </Badge>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-3 md:ml-auto">
                                {!isEditingProfile && (
                                    <Button
                                        onClick={() => setIsEditingProfile(true)}
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Main Content Tabs */}
                <Tabs defaultValue="information" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-white border">
                        <TabsTrigger value="information" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                            <User className="w-4 h-4 mr-2" />
                            Account Information
                        </TabsTrigger>
                        <TabsTrigger value="security" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                            <Lock className="w-4 h-4 mr-2" />
                            Security
                        </TabsTrigger>
                    </TabsList>

                    {/* Information Tab */}
                    <TabsContent value="information" className="space-y-6">
                        <Card className="bg-white shadow-lg border-0">
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {!isEditingProfile ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Name */}
                                        <div className="space-y-2">
                                            <Label className="text-gray-600 text-sm">Full Name</Label>
                                            <p className="text-gray-900 font-medium">{profileData.name}</p>
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-2">
                                            <Label className="text-gray-600 text-sm">Email Address</Label>
                                            <div className="flex items-center gap-2">
                                                <p className="text-gray-900 font-medium">{profileData.email}</p>
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                            </div>
                                        </div>

                                        {/* Department */}
                                        <div className="space-y-2">
                                            <Label className="text-gray-600 text-sm">Department</Label>
                                            <p className="text-gray-900 font-medium">{profileData.department}</p>
                                        </div>

                                        {/* Section */}
                                        <div className="space-y-2">
                                            <Label className="text-gray-600 text-sm">Section</Label>
                                            <p className="text-gray-900 font-medium">{profileData.section || 'Not specified'}</p>
                                        </div>

                                        {/* Phone */}
                                        <div className="space-y-2">
                                            <Label className="text-gray-600 text-sm">Phone Number</Label>
                                            <p className="text-gray-900 font-medium">{profileData.phoneNumber || 'Not provided'}</p>
                                        </div>

                                        {/* Join Date */}
                                        <div className="space-y-2">
                                            <Label className="text-gray-600 text-sm">Member Since</Label>
                                            <p className="text-gray-900 font-medium">
                                                {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : 'Not available'}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Edit Form */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Name Input */}
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-gray-700">Full Name *</Label>
                                                <Input
                                                    id="name"
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                    placeholder="Enter your full name"
                                                    className="border-gray-300"
                                                />
                                            </div>

                                            {/* Email Input */}
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-gray-700">Email Address *</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={profileData.email}
                                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                    placeholder="your.email@university.edu"
                                                    className="border-gray-300"
                                                />
                                            </div>

                                            {/* Department Input */}
                                            <div className="space-y-2">
                                                <Label htmlFor="department" className="text-gray-700">Department *</Label>
                                                <Input
                                                    id="department"
                                                    value={profileData.department}
                                                    onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                                                    placeholder="Your department"
                                                    className="border-gray-300"
                                                />
                                            </div>

                                            {/* Section Input */}
                                            <div className="space-y-2">
                                                <Label htmlFor="section" className="text-gray-700">Section</Label>
                                                <Input
                                                    id="section"
                                                    value={profileData.section}
                                                    onChange={(e) => setProfileData({ ...profileData, section: e.target.value })}
                                                    placeholder="e.g., A, B, C"
                                                    className="border-gray-300"
                                                />
                                            </div>

                                            {/* Phone Input */}
                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    value={profileData.phoneNumber}
                                                    onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                                                    placeholder="+1 (555) 123-4567"
                                                    className="border-gray-300"
                                                />
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 pt-4">
                                            <Button
                                                onClick={handleSaveProfile}
                                                disabled={isSaving}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                {isSaving ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                            <Button
                                                onClick={() => setIsEditingProfile(false)}
                                                variant="outline"
                                                disabled={isSaving}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-6">
                        {/* Password Change Section */}
                        <Card className="bg-white shadow-lg border-0">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-indigo-600" />
                                    Change Password
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {!isChangingPassword ? (
                                    <div className="space-y-4">
                                        <p className="text-gray-600">
                                            Keep your account secure by changing your password regularly.
                                        </p>
                                        <Button
                                            onClick={() => setIsChangingPassword(true)}
                                            className="bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            <Lock className="w-4 h-4 mr-2" />
                                            Change Password
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Current Password */}
                                        <div className="space-y-2">
                                            <Label htmlFor="current-password" className="text-gray-700">Current Password *</Label>
                                            <div className="relative">
                                                <Input
                                                    id="current-password"
                                                    type={showPasswordVisibility.current ? 'text' : 'password'}
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                    placeholder="Enter current password"
                                                    className="border-gray-300 pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswordVisibility({
                                                        ...showPasswordVisibility,
                                                        current: !showPasswordVisibility.current
                                                    })}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showPasswordVisibility.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* New Password */}
                                        <div className="space-y-2">
                                            <Label htmlFor="new-password" className="text-gray-700">New Password *</Label>
                                            <div className="relative">
                                                <Input
                                                    id="new-password"
                                                    type={showPasswordVisibility.new ? 'text' : 'password'}
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    placeholder="Enter new password (min 6 characters)"
                                                    className="border-gray-300 pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswordVisibility({
                                                        ...showPasswordVisibility,
                                                        new: !showPasswordVisibility.new
                                                    })}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showPasswordVisibility.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="space-y-2">
                                            <Label htmlFor="confirm-password" className="text-gray-700">Confirm New Password *</Label>
                                            <div className="relative">
                                                <Input
                                                    id="confirm-password"
                                                    type={showPasswordVisibility.confirm ? 'text' : 'password'}
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    placeholder="Re-enter new password"
                                                    className="border-gray-300 pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswordVisibility({
                                                        ...showPasswordVisibility,
                                                        confirm: !showPasswordVisibility.confirm
                                                    })}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showPasswordVisibility.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Password Requirements */}
                                        <Alert className="bg-blue-50 border-blue-200">
                                            <AlertCircle className="h-4 w-4 text-blue-600" />
                                            <AlertDescription className="text-blue-800 text-sm">
                                                Password must be at least 6 characters and different from your current password.
                                            </AlertDescription>
                                        </Alert>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 pt-4">
                                            <Button
                                                onClick={handleChangePassword}
                                                disabled={isSaving}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                {isSaving ? 'Updating...' : 'Update Password'}
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setIsChangingPassword(false);
                                                    resetPasswordForm();
                                                }}
                                                variant="outline"
                                                disabled={isSaving}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Session Management */}
                        <Card className="bg-white shadow-lg border-0">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <LogOut className="w-5 h-5 text-red-600" />
                                    Session
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-gray-600">
                                        Sign out of your account to end your current session.
                                    </p>
                                    <Button
                                        onClick={() => setShowLogoutConfirm(true)}
                                        variant="outline"
                                        className="border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Sign Out
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Logout Confirmation Dialog */}
                <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
                    <AlertDialogContent>
                        <AlertDialogTitle>Confirm Sign Out</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to sign out? You'll need to log in again to access your account.
                        </AlertDialogDescription>
                        <div className="flex gap-3 justify-end">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Sign Out
                            </AlertDialogAction>
                        </div>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </FacultyLayout>
    );
};

export default FacultyProfile;
