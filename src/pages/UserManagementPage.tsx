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
import { Button } from "@/components/ui/button";
import { Users, UserCheck, UserCog, Search, FileText, Copy } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { apiClient } from "@/lib/api";
import { useNotification } from "@/context/NotificationContext";

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [filterDept, setFilterDept] = useState("all");

    // Pagination & loading
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(50);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalUsers, setTotalUsers] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    // Debounced search to avoid frequent filtering on every keystroke
    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

    // Load users from API (paginated)
    useEffect(() => {
        (async () => {
            setLoading(true);
            const res = await apiClient.getUsers({ page, limit });
            setLoading(false);
            if (!res.error && res.data?.users) {
                setUsers(res.data.users);
                setTotalUsers(res.data.pagination?.total || 0);
                setTotalPages(res.data.pagination?.pages || 1);
            } else {
                console.error('Failed to load users', res.error);
            }
        })();
    }, [page, limit]);

    // viewFacultyPage() function
    const viewFacultyPage = () => users.filter((u: any) => u.role === 'faculty');

    // viewStudentPage() function
    const viewStudentPage = () => users.filter((u: any) => u.role === 'student');

    // LIVE STATS
    const facultyList = viewFacultyPage();
    const studentList = viewStudentPage();

    const stats = {
        total: users.length,
        students: studentList.length,
        faculty: facultyList.length,
    };
    // Search debounce (300ms)
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
        return () => clearTimeout(t);
    }, [searchTerm]);

    // Memoized filtering on the current page's users to avoid extra setState and re-renders
    const filteredUsers = useMemo(() => {
        let data = users;

        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            data = data.filter((u) =>
                (u.name || '').toLowerCase().includes(q) ||
                (u.username || '').toLowerCase().includes(q)
            );
        }

        if (filterRole !== 'all') {
            data = data.filter((u) => u.role === filterRole);
        }

        if (filterDept !== 'all') {
            data = data.filter((u) => u.department === filterDept);
        }

        return data;
    }, [users, debouncedSearch, filterRole, filterDept]);

    // Create dynamic department list
    const departments = Array.from(
        new Set(users.map((u) => u.department).filter(Boolean))
    );

    const { addNotification } = useNotification();

    const exportUsersCsv = () => {
        if (!filteredUsers || filteredUsers.length === 0) {
            addNotification?.({ type: 'error', message: 'No users to export' });
            return;
        }

        const headers = ['Name', 'Username', 'Email', 'Role', 'Department', 'Year', 'Created'];
        const rows = filteredUsers.map((u) => [
            u.name || '',
            u.username || '',
            u.email || '',
            u.role || '',
            u.department || '',
            u.yearOfStudy || '',
            u.createdAt || '',
        ]);

        const csvContent = [headers, ...rows]
            .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        addNotification?.({ type: 'success', message: 'CSV exported' });
    };

    const copyUserEmails = async () => {
        const emails = Array.from(new Set(filteredUsers.map((u) => u.email).filter(Boolean)));
        if (emails.length === 0) {
            addNotification?.({ type: 'error', message: 'No emails to copy' });
            return;
        }

        const text = emails.join(', ');
        try {
            await navigator.clipboard.writeText(text);
            addNotification?.({ type: 'success', message: `Copied ${emails.length} emails` });
        } catch (err) {
            console.error('Copy failed', err);
            addNotification?.({ type: 'error', message: 'Failed to copy to clipboard' });
        }
    };

    return (
        <FacultyLayout>
            <div className="font-body flex w-full">
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

                        <div className="flex gap-2 mb-4 items-center">
                            <Button variant="secondary" onClick={exportUsersCsv}><FileText className="h-4 w-4 mr-2" />Export CSV</Button>
                            <Button variant="ghost" onClick={copyUserEmails}><Copy className="h-4 w-4 mr-2" />Copy Emails</Button>
                            <Button variant="outline" onClick={async () => {
                                setLoading(true);
                                const res = await apiClient.getUsers({ page, limit });
                                setLoading(false);
                                if (!res.error && res.data?.users) {
                                    setUsers(res.data.users);
                                    setTotalUsers(res.data.pagination?.total || 0);
                                    setTotalPages(res.data.pagination?.pages || 1);
                                    addNotification?.({ type: 'success', message: 'Refreshed users' });
                                } else {
                                    addNotification?.({ type: 'error', message: res.error || 'Failed to refresh users' });
                                }
                            }}>Refresh</Button>

                            <div className="ml-auto text-sm text-muted-foreground">Showing {filteredUsers.length} of {totalUsers} users</div>
                        </div>

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
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={6} className="p-6 text-center text-gray-500">Loading users…</td>
                                                </tr>
                                            ) : filteredUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="p-6 text-center text-gray-500">No users found</td>
                                                </tr>
                                            ) : (
                                                filteredUsers.map((u) => (
                                                    <tr key={u._id || u.username} className="border-t">
                                                        <td className="p-3">{u.name}</td>
                                                        <td className="p-3">{u.username}</td>
                                                        <td className="p-3 capitalize">
                                                            <span>{u.role}</span>
                                                        </td>
                                                        <td className="p-3">{u.department || "-"}</td>
                                                        <td className="p-3">{u.yearOfStudy || "-"}</td>
                                                        <td className="p-3 text-gray-500">{u.createdAt}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </CardContent>

                                {/* Pagination controls */}
                                <div className="flex items-center justify-between p-4">
                                    <div className="flex gap-2 items-center">
                                        <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
                                        <div className="text-sm">Page {page} / {totalPages}</div>
                                        <Button variant="ghost" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
                                    </div>

                                    <div className="flex gap-2 items-center">
                                        <label className="text-sm">Per page:</label>
                                        <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="border rounded px-2 py-1">
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                    </div>
                                </div>

                            </div>
                        </Card>

                    </div>
                </div>
            </div>
        </FacultyLayout>
    );
}
