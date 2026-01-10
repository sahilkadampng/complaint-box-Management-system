import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api';
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Camera, Save, Eye, EyeOff, ArrowLeft, Trash2 } from 'lucide-react';

interface FormData {
    name: string;
    email: string;
    department: string;
    yearOfStudy: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const Profile: React.FC = () => {
    const { user: authUser, updateUser } = useAuth();
    const { showSuccess, showError } = useNotification();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Use auth user from context as the source of truth; avoid storing full user in localStorage
    const [user, setUser] = useState(authUser || null);

    const [formData, setFormData] = useState<FormData>({
        name: user?.name || '',
        email: user?.email || '',
        department: user?.department || '',
        yearOfStudy: user?.yearOfStudy || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Keep local 'user' in sync with auth context when it changes
        if (authUser) setUser(authUser);
    }, [authUser]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // ✅ Allow only extensions
        const validExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (!validExtensions.includes(fileExtension)) {
            showError('Only .png, .jpg, .jpeg, .gif files are allowed');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            showError('Profile picture must be less than 10MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64String = event.target?.result as string;
            if (!user) return;

            const updatedUser = { ...user, profilePicture: base64String };
            setUser(updatedUser);

            try {
                await updateUser({ profilePicture: base64String });
                showSuccess('Profile picture updated successfully!');
            } catch {
                showError('Failed to update profile picture');
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveProfilePicture = async () => {
        if (!user) return;
        const updatedUser = { ...user, profilePicture: '' };
        setUser(updatedUser);

        try {
            await updateUser({ profilePicture: '' });
            showSuccess('Profile picture removed');
        } catch {
            showError('Failed to remove profile picture');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (formData.newPassword) {
                if (formData.newPassword !== formData.confirmPassword) {
                    showError('New passwords do not match');
                    setIsLoading(false);
                    return;
                }
                if (formData.newPassword.length < 6) {
                    showError('New password must be at least 6 characters long');
                    setIsLoading(false);
                    return;
                }
                if (!formData.currentPassword) {
                    showError('Please enter your current password');
                    setIsLoading(false);
                    return;
                }
            }

            const updateData: any = {
                name: formData.name,
                email: formData.email,
            };

            if (user?.role === 'student') updateData.yearOfStudy = formData.yearOfStudy;
            if (user?.role === 'faculty') updateData.department = formData.department;

            // If password change requested, call change-password endpoint
            if (formData.newPassword) {
                const pwdRes = await apiClient.changePassword(formData.currentPassword, formData.newPassword);
                if (pwdRes.error) {
                    showError(pwdRes.error);
                    setIsLoading(false);
                    return;
                }
            }

            await updateUser(updateData);

            const updatedUser = { ...user, ...updateData };
            setUser(updatedUser);

            showSuccess(formData.newPassword ? 'Password changed successfully!' : 'Profile updated successfully!');

            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            }));
        } catch (error: any) {
            showError(error.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const getInitials = (name: string) => {
        if (!name) return '';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="font-vend">
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                <div className="mb-4">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                </div>

                <div className="space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text">Profile</h1>
                        <p className="text-muted-foreground">Manage your account settings and personal information</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {/* Profile Picture */}
                        <Card className="md:col-span-1">
                            <CardHeader className="text-center">
                                <CardTitle>Profile Picture</CardTitle>
                                <CardDescription>Upload a profile picture to personalize your account</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center space-y-4">
                                <div className="relative">
                                    <Avatar className="h-32 w-32 ring-4 ring-primary/20 mb-7">
                                        {user.profilePicture ? (
                                            <AvatarImage src={user.profilePicture} alt={user.name} />
                                        ) : (
                                            <AvatarFallback className="text-3xl font-bold text-white bg-primary flex items-center justify-center">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div className="absolute -bottom-0 -right-0 flex space-x-2 mr-4">
                                        <Button
                                            size="sm"
                                            className="h-10 w-10 rounded-full bg-gray-200 hover:bg-gray-300 p-0"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Camera className="h-4 w-4 text-black" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-10 w-10 rounded-full p-0 bg-gray-200 hover:bg-gray-300 mt-0"
                                            onClick={handleRemoveProfilePicture}
                                        >
                                            <Trash2 className="h-4 w-4 text-black" />
                                        </Button>
                                    </div>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".png,.jpg,.jpeg,.gif"
                                    className="hidden"
                                    onChange={handleProfilePictureChange}
                                />
                                <div className="text-center space-y-2">
                                    <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                                    <p className="text-sm text-muted-foreground">Allowed: .png, .jpg, .jpeg, .gif | Max 10MB</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Personal Info */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>Update your details and account settings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                                        </div>
                                    </div>

                                    {user.role === 'student' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="yearOfStudy">Academic Year</Label>
                                            <Input id="yearOfStudy" name="yearOfStudy" value={formData.yearOfStudy} onChange={handleInputChange} />
                                        </div>
                                    )}

                                    {user.role === 'faculty' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="department">Department</Label>
                                            <Input id="department" name="department" value={formData.department} onChange={handleInputChange} />
                                        </div>
                                    )}

                                    <Separator />

                                    {/* Change Password */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Change Password</h3>
                                        <p className="text-sm text-muted-foreground">Leave blank if you don't want to change your password</p>

                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword">Current Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="currentPassword"
                                                    name="currentPassword"
                                                    type={showPasswords.current ? 'text' : 'password'}
                                                    value={formData.currentPassword}
                                                    onChange={handleInputChange}
                                                    className="pr-10"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-black"
                                                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                                >
                                                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="newPassword">New Password</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="newPassword"
                                                        name="newPassword"
                                                        type={showPasswords.new ? 'text' : 'password'}
                                                        value={formData.newPassword}
                                                        onChange={handleInputChange}
                                                        className="pr-10"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-black"
                                                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                                    >
                                                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="confirmPassword"
                                                        name="confirmPassword"
                                                        type={showPasswords.confirm ? 'text' : 'password'}
                                                        value={formData.confirmPassword}
                                                        onChange={handleInputChange}
                                                        className="pr-10"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-black"
                                                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                                    >
                                                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                                            <Save className="h-4 w-4" />
                                            {isLoading ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
