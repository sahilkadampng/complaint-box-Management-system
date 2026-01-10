import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@/context/NotificationContext";
import { apiClient } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
// import Navbar from "@/components/Navbar";
import Breadcrumb from "@/components/Breadcrumb";
import FacultyLayout from "@/components/FacultyLayout";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import {
    User,
    Lock,
    Bell,
    Paintbrush,
    Trash2,
    Eye,
    EyeOff,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
    const { user, logout, updateUser } = useAuth();

    const [showPwd, setShowPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);

    // Notification prefs local state (sync with user)
    const [emailAlertsEnabled, setEmailAlertsEnabled] = useState<boolean>(user?.emailAlerts ?? true);
    const [systemMessagesEnabled, setSystemMessagesEnabled] = useState<boolean>(user?.systemMessages ?? true);

    // Keep local state in sync if user changes
    useEffect(() => {
        setEmailAlertsEnabled(user?.emailAlerts ?? true);
        setSystemMessagesEnabled(user?.systemMessages ?? true);
    }, [user]);

    const handleToggleEmailAlerts = async (val: boolean) => {
        setEmailAlertsEnabled(val);
        try {
            await updateUser({ emailAlerts: val });
            addNotification?.({ type: 'success', message: 'Email notification preference updated' });
        } catch (err) {
            console.error('Failed to update email alerts', err);
            setEmailAlertsEnabled(!val);
            addNotification?.({ type: 'error', message: 'Failed to update preference' });
        }
    };

    const handleToggleSystemMessages = async (val: boolean) => {
        setSystemMessagesEnabled(val);
        try {
            await updateUser({ systemMessages: val });
            addNotification?.({ type: 'success', message: 'System messages preference updated' });
        } catch (err) {
            console.error('Failed to update system messages', err);
            setSystemMessagesEnabled(!val);
            addNotification?.({ type: 'error', message: 'Failed to update preference' });
        }
    };

    // Change password states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Delete account modal & state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmInput, setConfirmInput] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();
    const { addNotification } = useNotification();

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            addNotification?.({ type: 'error', message: 'Please fill in both current and new password' });
            return;
        }
        if (newPassword.length < 6) {
            addNotification?.({ type: 'error', message: 'New password must be at least 6 characters' });
            return;
        }
        if (newPassword !== confirmNewPassword) {
            addNotification?.({ type: 'error', message: 'New passwords do not match' });
            return;
        }

        setIsChangingPassword(true);
        try {
            const res = await apiClient.changePassword(currentPassword, newPassword);
            if (res.error) {
                addNotification?.({ type: 'error', message: res.error });
                setIsChangingPassword(false);
                return;
            }

            addNotification?.({ type: 'success', message: res.data?.message || 'Password updated successfully' });
            // Clear fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            console.error('Change password failed', err);
            addNotification?.({ type: 'error', message: 'Failed to update password' });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;
        if (confirmInput !== user.username) {
            addNotification?.({ type: 'error', message: 'Username does not match. Please type your exact username to confirm.' });
            return;
        }

        setIsDeleting(true);
        try {
            const res = await apiClient.deleteUser(user.id);
            if (res.error) {
                addNotification?.({ type: 'error', message: res.error });
                setIsDeleting(false);
                return;
            }

            addNotification?.({ type: 'success', message: 'Your account has been deleted.' });
            // Clear local session and redirect
            logout();
            navigate('/login');
        } catch (err) {
            console.error('Failed to delete account', err);
            addNotification?.({ type: 'error', message: 'Failed to delete account' });
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
            setConfirmInput('');
        }
    };

    return (
        <FacultyLayout>
            <div className="font-body flex w-full">
                {/* SIDEBAR */}
                <Sidebar />
                {/* MAIN AREA */}
                <div className="ml-[0rem] mr-[0rem] mt-10 flex-1 h-screen overflow-y-auto bg-background p-2">

                    {/* ===========================
                    TOP NAVBAR (same style as dashboard)
                ============================ */}
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between p-2 md:p-6">
                        <div>
                            <h1 className="text-2xl font-bold mb-1 text-black mt-10">Settings</h1>
                            <p className="text-black text-sm md:text-base">Extract, analyze, and export detailed complaint data.</p>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-2 pt-4">
                        <hr className="my-4" />
                        <Breadcrumb current="Settings" />
                    </div>

                    {/* Content */}
                    <main className="max-w-7xl mx-auto px-2 py-6 space-y-10">

                        {/* Profile Settings */}
                        <Card className="shadow-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <User className="h-5 w-5" /> Profile Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">

                                {/* Username */}
                                <div>
                                    <label className="text-sm font-medium">Full Name</label>
                                    <Input
                                        value={user?.name || ""}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        disabled
                                        value={user?.email || ""}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Username</label>
                                    <Input
                                        disabled
                                        defaultValue={user?.username}
                                        className="mt-1"
                                    />
                                </div>

                                <Button className="mt-2">Save Changes</Button>
                            </CardContent>
                        </Card>

                        {/* Password Section */}
                        <Card className="shadow-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Lock className="h-5 w-5" /> Change Password
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">

                                {/* Current Password */}
                                <div>
                                    <label className="text-sm font-medium">Current Password</label>
                                    <div className="relative">
                                        <Input
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            type={showPwd ? "text" : "password"}
                                            className="mt-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowPwd(!showPwd)}
                                        >
                                            {showPwd ? <EyeOff /> : <Eye />}
                                        </Button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="text-sm font-medium">New Password</label>
                                    <div className="relative">
                                        <Input
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            type={showNewPwd ? "text" : "password"}
                                            className="mt-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowNewPwd(!showNewPwd)}
                                        >
                                            {showNewPwd ? <EyeOff /> : <Eye />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Confirm New Password */}
                                <div>
                                    <label className="text-sm font-medium">Confirm New Password</label>
                                    <Input
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        type={showNewPwd ? "text" : "password"}
                                        className="mt-1"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button className="mt-2" onClick={handleChangePassword} disabled={isChangingPassword}>
                                        {isChangingPassword ? 'Updating…' : 'Update Password'}
                                    </Button>
                                    <Button className="mt-2" variant="outline" onClick={() => { setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); }}>
                                        Clear
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notifications */}
                        <Card className="shadow-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Bell className="h-5 w-5" /> Notification Preferences
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">

                                <div className="flex justify-between items-center">
                                    <p>Email Alerts</p>
                                    <Switch checked={emailAlertsEnabled} onCheckedChange={(v: boolean) => handleToggleEmailAlerts(v)} />
                                </div>

                                <div className="flex justify-between items-center">
                                    <p>Complaint Status Updates</p>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex justify-between items-center">
                                    <p>System Messages</p>
                                    <Switch checked={systemMessagesEnabled} onCheckedChange={(v: boolean) => handleToggleSystemMessages(v)} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Theme */}
                        <Card className="shadow-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Paintbrush className="h-5 w-5" /> Appearance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm">Theme</p>

                                <div className="flex gap-3">
                                    <Button variant="secondary">Light</Button>
                                    <Button variant="secondary">Dark</Button>
                                    <Button variant="secondary">System</Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Danger Zone */}
                        <Card className="border-red-400 shadow-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-red-600">
                                    <Trash2 className="h-5 w-5" /> Want to Delete Your Account?
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-3">
                                    Deleting your account will remove all your data permanently.
                                </p>

                                <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>Delete Account</Button>

                                {/* Delete Modal */}
                                {showDeleteModal && (
                                    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
                                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">

                                            <button
                                                onClick={() => { setShowDeleteModal(false); setConfirmInput(''); }}
                                                className="absolute top-4 right-4 focus:outline-none"
                                            >
                                                ✕
                                            </button>

                                            <div className="flex justify-center mb-4">
                                                <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
                                                    <svg
                                                        className="h-10 w-10 text-red-600"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth={3}
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>

                                            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Delete Your Account</h2>
                                            <p className="text-gray-600 text-center mb-4">Type your <span className="font-medium text-red-500">Username</span> to confirm deletion. This action cannot be undone.</p>

                                            <div className="mb-4">
                                                <Input placeholder="Enter username to confirm" value={confirmInput} onChange={(e) => setConfirmInput(e.target.value)} />
                                            </div>

                                            <div className="flex gap-3">
                                                <Button className="flex-1" variant="destructive" disabled={confirmInput !== user?.username || isDeleting} onClick={handleDeleteAccount}>
                                                    {isDeleting ? 'Deleting…' : 'Delete Account'}
                                                </Button>
                                                <Button className="flex-1" variant="outline" onClick={() => { setShowDeleteModal(false); setConfirmInput(''); }}>Cancel</Button>
                                            </div>

                                            <div className="bg-red-50 border border-red-100 rounded-lg p-3 mt-4 text-sm text-red-700">
                                                <p><strong>Note:</strong> This will permanently remove your account and all associated complaints.</p>
                                            </div>

                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </div>
        </FacultyLayout>
    );
}