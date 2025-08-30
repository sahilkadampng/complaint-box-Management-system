import { useState } from "react";
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
    const { user } = useAuth();

    const [showPwd, setShowPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);

    return (
        <FacultyLayout>
            <div className="font-vend flex w-full">
                {/* Sidebar */}
                <div className="hidden md:block fixed top-0 left-0 h-full w-64 bg-white shadow-md z-50">
                    <Sidebar />
                </div>

                {/* Main Area */}
                <div className="flex-1 md:ml-64 ml-0 bg-gray-50 min-h-screen relative">


                    {/* Header */}
                    <div className="bg-white shadow-sm mt-[64px]">
                        <div className="max-w-7xl mx-auto p-6">
                            <h1 className="text-3xl font-bold text-black">Settings</h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Extract, analyze, and export detailed complaint data.
                            </p>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 pt-4">
                        <Breadcrumb current="Settings" />
                    </div>

                    {/* Content */}
                    <main className="max-w-7xl mx-auto px-6 py-6 space-y-10">

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
                                        disabled
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

                                <Button className="mt-2">Update Password</Button>
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
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex justify-between items-center">
                                    <p>Complaint Status Updates</p>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex justify-between items-center">
                                    <p>System Messages</p>
                                    <Switch />
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

                                <Button variant="destructive">Delete Account</Button>
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </div>
        </FacultyLayout>
    );
}