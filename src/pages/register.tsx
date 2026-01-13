import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Users, ArrowLeft, Eye, EyeOff } from "lucide-react";
// import Navbar from "@/components/Navbar";
import FacultyLayout from "@/components/FacultyLayout";
// import Sidebar from '@/components/Sidebar';

const RegisterUserPage: React.FC = () => {
    const { signup, user } = useAuth();
    const { addNotification } = useNotification();
    const navigate = useNavigate();

    const [selectedRole, setSelectedRole] = useState<"student" | "faculty" | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        studentId: "",
        rollNumber: "",
        department: "",
        section: "",
        yearOfStudy: "",
        phoneNumber: "",
        program: "",
    });

    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ current: false, confirm: false });

    const departmentPrograms: Record<string, string[]> = {
        "Computer Science": ["BSc CA", "BBA CA", "MSc CS"],
        Electronics: ["Diploma Electronics", "B.Tech Electronics"],
        Mechanical: ["Diploma Mechanical", "B.Tech Mechanical"],
        Civil: ["Diploma Civil", "B.Tech Civil"],
        Chemical: ["Diploma Chemical", "B.Tech Chemical"],
        Business: ["BBA", "MBA", "BCom"],
        Arts: ["BA English", "BA History", "BA Psychology"],
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedRole) {
            addNotification({ type: "error", message: "Please select your role" });
            return;
        }

        if (!formData.name.trim() || !formData.email.trim() || !formData.username.trim() || !formData.password) {
            addNotification({ type: "error", message: "Please fill in all required fields" });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            addNotification({ type: "error", message: "Passwords do not match" });
            return;
        }

        if (!formData.department) {
            addNotification({ type: "error", message: "Please select a department" });
            return;
        }

        if (!formData.section.trim()) {
            addNotification({ type: "error", message: "Please enter section" });
            return;
        }

        setIsLoading(true);

        try {
            const result = await signup({
                name: formData.name.trim(),
                email: formData.email.trim(),
                username: formData.username.trim(),
                password: formData.password,
                role: selectedRole,
                createdBy: user?.username || "system",
                createdAt: new Date().toLocaleString(),

                // Optional: for students
                department: formData.department,
                section: formData.section.trim(),
                yearOfStudy: formData.yearOfStudy,
            });

            if (result.success) {
                addNotification({ type: "success", message: "Account created successfully!" });

                setFormData({
                    name: "",
                    email: "",
                    username: "",
                    password: "",
                    confirmPassword: "",
                    studentId: "",
                    rollNumber: "",
                    department: "",
                    section: "",
                    yearOfStudy: "",
                    phoneNumber: "",
                    program: "",
                });
                setSelectedRole(null);
            } else {
                addNotification({
                    type: 'warning',
                    message: result.error || 'Username already taken for this role.'
                });
            }
        }
        catch {
            addNotification({ type: "error", message: "Signup failed. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <FacultyLayout>
            <div className="font-body flex w-full">
                {/* <Sidebar /> */}

                <div className="max-w-2xl mx-auto px-6 py-8">
                    <Button className="bg-gray-100 hover:bg-gray-200 text-black shadow-sm mb-4 mt-20" onClick={() => navigate("/faculty-dashboard")}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>

                    <div className="text-center mb-8 px-0 py-8">
                        <h1 className="text-3xl font-bold text-foreground">Institutional User Registration</h1>
                        <p className="text-muted-foreground mt-2"> Onboard Student/Faculty </p>
                    </div>

                    {/* Faculty Only Button */}
                    {user?.role === "faculty" && (
                        <div className="mb-6 flex flex-row gap-3">
                            {/* View Students Button */}
                            <Button asChild className="bg-primary hover:bg-primary/90">
                                <Link to="/view-students">View Students</Link>
                            </Button>

                            {/* View Faculty Button */}
                            <Button asChild className="bg-primary hover:bg-primary/90">
                                <Link to="/view-faculty">View Faculty</Link>
                            </Button>
                        </div>
                    )}

                    {/* === Register Form === */}
                    <Card className="shadow-hover">
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange("name", e.target.value)}
                                                placeholder="Enter full name"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange("email", e.target.value)}
                                                placeholder="Enter email"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="username">Username *</Label>
                                            <Input
                                                id="username"
                                                type="text"
                                                value={formData.username}
                                                onChange={(e) => handleInputChange("username", e.target.value)}
                                                placeholder="Choose a username"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="department">Department *</Label>
                                            <Select
                                                value={formData.department}
                                                onValueChange={(value) => {
                                                    handleInputChange("department", value);
                                                    // Reset program when department changes
                                                    handleInputChange("program", "");
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.keys(departmentPrograms).map((dept) => (
                                                        <SelectItem key={dept} value={dept}>
                                                            {dept}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="section">Section *</Label>
                                            <Input
                                                id="section"
                                                type="text"
                                                value={formData.section}
                                                onChange={(e) => handleInputChange("section", e.target.value)}
                                                placeholder="Enter section (e.g., A/B)"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password *</Label>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showPasswords.current ? "text" : "password"}
                                                    value={formData.password}
                                                    onChange={(e) => handleInputChange("password", e.target.value)}
                                                    placeholder="Create password"
                                                    required
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3"
                                                    onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                                                >
                                                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                            <div className="relative">
                                                <Input
                                                    id="confirmPassword"
                                                    type={showPasswords.confirm ? "text" : "password"}
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                                    placeholder="Confirm password"
                                                    required
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3"
                                                    onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                                                >
                                                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Role Selection */}
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-4">Select Your Role *</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card
                                            className={`cursor-pointer ${selectedRole === "student" ? "ring-2 ring-primary bg-primary/5" : "hover:shadow-hover"}`}
                                            onClick={() => setSelectedRole("student")}
                                        >
                                            <CardContent className="p-6 text-center">
                                                <GraduationCap className="h-8 w-8 text-primary mx-auto mb-3" />
                                                <h4 className="font-semibold">Student</h4>
                                            </CardContent>
                                        </Card>

                                        <Card
                                            className={`cursor-pointer ${selectedRole === "faculty" ? "ring-2 ring-primary bg-primary/5" : "hover:shadow-hover"}`}
                                            onClick={() => setSelectedRole("faculty")}
                                        >
                                            <CardContent className="p-6 text-center">
                                                <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                                                <h4 className="font-semibold">Faculty</h4>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                {/* Student Info */}
                                {selectedRole === "student" && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground mb-4">Student Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="studentId">Student ID *</Label>
                                                <Input id="studentId" type="text" value={formData.studentId} onChange={(e) => handleInputChange("studentId", e.target.value)} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="rollNumber">Roll Number *</Label>
                                                <Input id="rollNumber" type="text" value={formData.rollNumber} onChange={(e) => handleInputChange("rollNumber", e.target.value)} />
                                            </div>

                                            {formData.department && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="program">Program *</Label>
                                                    <Select value={formData.program} onValueChange={(value) => handleInputChange("program", value)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Program" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {departmentPrograms[formData.department].map((prog) => (
                                                                <SelectItem key={prog} value={prog}>
                                                                    {prog}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <Label htmlFor="yearOfStudy">Year of Study *</Label>
                                                <Select value={formData.yearOfStudy} onValueChange={(value) => handleInputChange("yearOfStudy", value)}>
                                                    <SelectTrigger>
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
                                                <Label htmlFor="phoneNumber">Phone Number *</Label>
                                                <Input id="phoneNumber" type="tel" value={formData.phoneNumber} onChange={(e) => handleInputChange("phoneNumber", e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Terms */}
                                <div className="flex items-start space-x-3">
                                    <Checkbox id="terms" checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)} />
                                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                                        I agree to the{" "}
                                        <Link to="#" className="text-primary font-medium">
                                            Terms and Conditions
                                        </Link>{" "}
                                        and{" "}
                                        <Link to="#" className="text-primary font-medium">
                                            Privacy Policy
                                        </Link>
                                        .
                                    </Label>
                                </div>

                                <Button type="submit" disabled={isLoading} className="w-full bg-sky-500 text-lg py-6">
                                    {isLoading ? "Creating Account..." : "Create Account"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </FacultyLayout>
    );
};

export default RegisterUserPage;
