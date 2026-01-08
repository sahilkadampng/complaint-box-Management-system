import Sidebar from "@/components/Sidebar";
import FacultyLayout from "@/components/FacultyLayout";
import Breadcrumb from "@/components/Breadcrumb";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Users, UserCheck, UserCog, Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [filterDept, setFilterDept] = useState("all");

    // Load all users from localStorage
    useEffect(() => {
        const all = JSON.parse(localStorage.getItem("users") || "[]");
        setUsers(all);
        setFilteredUsers(all);
    }, []);

    // ============================
    // viewFacultyPage() function
    // ============================
    const viewFacultyPage = () => {
        const all = JSON.parse(localStorage.getItem("users") || "[]");
        return all.filter((u: any) => u.role === "faculty");
    };

    // ============================
    // viewStudentPage() function
    // ============================
    const viewStudentPage = () => {
        const all = JSON.parse(localStorage.getItem("users") || "[]");
        return all.filter((u: any) => u.role === "student");
    };

    // ============================
    // LIVE STATS
    // ============================
    const facultyList = viewFacultyPage();
    const studentList = viewStudentPage();

    const stats = {
        total: users.length,
        students: studentList.length,
        faculty: facultyList.length,
    };

    // ============================
    //   FILTERS + SEARCH
    // ============================
    useEffect(() => {
        let data = users;

        // Search (name or username)
        if (searchTerm.trim()) {
            data = data.filter((u) =>
                u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.username.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Role filter
        if (filterRole !== "all") {
            data = data.filter((u) => u.role === filterRole);
        }

        // Department filter
        if (filterDept !== "all") {
            data = data.filter((u) => u.department === filterDept);
        }

        setFilteredUsers(data);
    }, [searchTerm, filterRole, filterDept, users]);

    // Create dynamic department list
    const departments = Array.from(
        new Set(users.map((u) => u.department).filter(Boolean))
    );

    return (
        <FacultyLayout>
            <div className="font-vend flex w-full">
                {/* Sidebar */}
                <Sidebar />

                {/* MAIN */}
                <div className="ml-[0rem] mr-[0rem] mt-10 flex-1 h-screen overflow-y-auto bg-background p-2">

                    {/* HEADER */}
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between p-2 md:p-6">
                        <div>
                            <h1 className="text-2xl font-bold mb-3 text-black mt-10">
                                User Management
                            </h1>
                            <p className="text-black text-sm md:text-base">
                                Manage all student & faculty accounts
                            </p>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-2 py-2">
                        <hr className="my-4" />
                        <Breadcrumb current="UserManagementPage" />

                        {/* STATS CARDS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">

                            <Card className="shadow-card rounded-md">
                                <CardContent className="p-5 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Users</p>
                                        <p className="text-2xl font-bold">{stats.total}</p>
                                    </div>
                                    <Users className="h-6 w-6 text-gray-400" />
                                </CardContent>
                            </Card>

                            <Card className="shadow-card rounded-md">
                                <CardContent className="p-5 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Students</p>
                                        <p className="text-2xl font-bold">{stats.students}</p>
                                    </div>
                                    <UserCheck className="h-6 w-6 text-gray-400" />
                                </CardContent>
                            </Card>

                            <Card className="shadow-card rounded-md">
                                <CardContent className="p-5 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Faculty</p>
                                        <p className="text-2xl font-bold">{stats.faculty}</p>
                                    </div>
                                    <UserCog className="h-6 w-6 text-gray-400" />
                                </CardContent>
                            </Card>

                        </div>

                        {/* FILTERS */}
                        <Card className="shadow-sm mb-4 shadow-card rounded-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Search className="h-5 w-5" /> Filter Users
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                {/* Search */}
                                <div>
                                    <label className="text-sm font-medium">Search</label>
                                    <Input
                                        type="text"
                                        className="mt-1"
                                        placeholder="Search by name or username..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="text-sm font-medium">Role</label>
                                    <Select value={filterRole} onValueChange={setFilterRole}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="student">Student</SelectItem>
                                            <SelectItem value="faculty">Faculty</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Department */}
                                <div>
                                    <label className="text-sm font-medium">Department</label>
                                    <Select value={filterDept} onValueChange={setFilterDept}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="All Departments" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept} value={dept}>
                                                    {dept}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                            </CardContent>
                        </Card>

                        {/* USER TABLE */}
                        <Card className="shadow-card rounded-md p-2">
                            <div className="ml-[-8px]">
                                <CardHeader>
                                    <CardTitle>User List</CardTitle>
                                    <hr className="my-4" />
                                </CardHeader>

                                <CardContent className="overflow-x-auto">
                                    <table className="w-full text-sm p-4">
                                        <thead>
                                            <tr className="bg-gray-100 text-left text-sm">
                                                <th className="p-3">Name</th>
                                                <th className="p-3">Username</th>
                                                <th className="p-3">Role</th>
                                                <th className="p-3">Department</th>
                                                <th className="p-3">Year</th>
                                                <th className="p-3">Created</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredUsers.map((u) => (
                                                <tr key={u.username} className="border-t">
                                                    <td className="p-3">{u.name}</td>
                                                    <td className="p-3">{u.username}</td>
                                                    <td className="p-3 capitalize">
                                                        <span>{u.role}</span>
                                                    </td>
                                                    <td className="p-3">{u.department || "NULL"}</td>
                                                    <td className="p-3">{u.yearOfStudy || "NULL"}</td>
                                                    <td className="p-3 text-gray-500">{u.createdAt}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </div>
                        </Card>

                    </div>
                </div>
            </div>
        </FacultyLayout>
    );
}
