import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from "react-router-dom";
import { useNotification } from '@/context/NotificationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Camera, Save, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface FormData {
    name: string;
    email: string;
    department: string;
    year: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const Profile: React.FC = () => {
    const { user: authUser, updateUser } = useAuth();
    const { showSuccess, showError } = useNotification();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Read user from localStorage first
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : authUser || null;
    });

    const [formData, setFormData] = useState<FormData>({
        name: user?.name || '',
        email: user?.email || '',
        department: user?.department || '',
        year: user?.year || '',
        currentPassword: user?.password || '',
        newPassword: '',
        confirmPassword: '',
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [isLoading, setIsLoading] = useState(false);

    // Keep localStorage updated whenever user changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showError('Profile picture must be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const base64String = event.target?.result as string;
                    await updateUser({ profilePicture: base64String });
                    showSuccess('Profile picture updated successfully!');
                    <AvatarImage src={user?.profilePicture} alt={user?.name} />
                } catch (error) {
                    showError('Failed to update profile picture');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Validate passwords if changing password
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
                    showError('Current password is required to change password');
                    setIsLoading(false);
                    return;
                }
                // ✅ Check if entered current password matches saved one
                if (formData.currentPassword !== user?.password) {
                    showError('Old password is incorrect');
                    setIsLoading(false);
                    return;
                }
            }

            const updateData: any = {
                name: formData.name,
                email: formData.email,
            };

            if (user?.role === 'student') {
                updateData.year = formData.year;
            }
            if (user?.role === 'faculty') {
                updateData.department = formData.department;
            }

            if (formData.newPassword) {
                updateData.password = formData.newPassword;

                // ✅ Update localStorage + state with new password
                const updatedUser = { ...user, ...updateData };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);
            }

            await updateUser(updateData);
            showSuccess(formData.newPassword ? 'Password changed successfully!' : 'Profile updated successfully!');

            // Clear password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            }));
        } catch (error) {
            showError(error instanceof Error ? error.message : 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="mb-4">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>
            <div className="space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                        Profile Settings
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and personal information
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {/* Profile Picture Card */}
                    <Card className="md:col-span-1">
                        <CardHeader className="text-center">
                            <CardTitle>Profile Picture</CardTitle>
                            <CardDescription>
                                Upload a profile picture to personalize your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center space-y-4">
                            <div className="relative">
                                <Avatar className="h-32 w-32 ring-4 ring-primary/20">
                                    <AvatarImage src={user.profilePicture} alt={user.name} />
                                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary-glow/20 text-primary text-2xl font-bold">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <Button
                                    size="sm"
                                    className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full p-0"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Camera className="h-4 w-4" />
                                </Button>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleProfilePictureChange}
                            />

                            <div className="text-center space-y-2">
                                <Badge variant="secondary" className="capitalize">
                                    {user.role}
                                </Badge>
                                <p className="text-sm text-muted-foreground">
                                    Maximum file size: 5MB
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Profile Information Card */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>
                                Update your personal details and account settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {user.role === 'student' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="year">Academic Year</Label>
                                        <Input
                                            id="year"
                                            name="year"
                                            placeholder=""
                                            value={formData.year}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                )}

                                {user.role === 'faculty' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department</Label>
                                        <Input
                                            id="department"
                                            name="department"
                                            placeholder="e.g., Computer Science, Mathematics"
                                            value={formData.department}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                )}

                                <Separator />

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Change Password</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Leave blank if you don't want to change your password
                                    </p>

                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Current Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="currentPassword"
                                                name="currentPassword"
                                                type={showPasswords.current ? "text" : "password"}
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
                                                {showPasswords.current ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
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
                                                    type={showPasswords.new ? "text" : "password"}
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
                                                    {showPasswords.new ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type={showPasswords.confirm ? "text" : "password"}
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

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={isLoading} className="min-w-32">
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                Saving...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Save className="h-4 w-4" />
                                                Save Changes
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;