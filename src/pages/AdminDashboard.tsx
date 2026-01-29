import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertCircle,
    BarChart3,
    Clock,
    Download,
    Filter,
    MessageSquare,
    Users,
    Zap,
    CheckCircle2,
} from 'lucide-react';

interface DashboardStats {
    totalComplaints: number;
    pendingComplaints: number;
    resolvedComplaints: number;
    escalatedComplaints: number;
    totalUsers: number;
    totalFaculty: number;
    avgResolutionTime: number;
}

interface Complaint {
    _id: string;
    title: string;
    status: string;
    studentName: string;
    category: string;
    createdAt: string;
    updatedAt: string;
}

interface User {
    _id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addNotification } = useNotification();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalComplaints: 0,
        pendingComplaints: 0,
        resolvedComplaints: 0,
        escalatedComplaints: 0,
        totalUsers: 0,
        totalFaculty: 0,
        avgResolutionTime: 0,
    });
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'complaints' | 'users'>('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Verify admin access
    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/');
            addNotification?.({ type: 'error', message: 'Admin access only' });
        }
    }, [user, navigate, addNotification]);

    // Load dashboard data
    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);

                // Get complaints
                const complaintsRes = await apiClient.getComplaints({ limit: 1000 });
                if (complaintsRes.data?.complaints) {
                    setComplaints(complaintsRes.data.complaints);
                    setFilteredComplaints(complaintsRes.data.complaints);

                    // Calculate stats
                    const total = complaintsRes.data.complaints.length;
                    const pending = complaintsRes.data.complaints.filter(
                        (c: any) => c.status !== 'resolved' && c.status !== 'escalated'
                    ).length;
                    const resolved = complaintsRes.data.complaints.filter(
                        (c: any) => c.status === 'resolved'
                    ).length;
                    const escalated = complaintsRes.data.complaints.filter(
                        (c: any) => c.status === 'escalated'
                    ).length;

                    setStats(prev => ({
                        ...prev,
                        totalComplaints: total,
                        pendingComplaints: pending,
                        resolvedComplaints: resolved,
                        escalatedComplaints: escalated,
                    }));
                }

                // Get users
                const usersRes = await apiClient.getUsers({ limit: 1000 });
                if (usersRes.data?.users) {
                    setUsers(usersRes.data.users);
                    const faculty = usersRes.data.users.filter((u: any) => u.role === 'faculty').length;
                    setStats(prev => ({
                        ...prev,
                        totalUsers: usersRes.data?.users?.length || 0,
                        totalFaculty: faculty,
                    }));
                }
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                addNotification?.({ type: 'error', message: 'Failed to load dashboard data' });
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [addNotification]);

    // Apply filters
    useEffect(() => {
        let filtered = complaints;

        if (statusFilter !== 'all') {
            filtered = filtered.filter(c => c.status === statusFilter);
        }

        if (searchQuery) {
            filtered = filtered.filter(c =>
                c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredComplaints(filtered);
    }, [searchQuery, statusFilter, complaints]);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            submitted: 'bg-gray-100 text-gray-700',
            in_review: 'bg-amber-100 text-amber-700',
            need_clarification: 'bg-purple-100 text-purple-700',
            assigned: 'bg-blue-100 text-blue-700',
            resolved: 'bg-green-100 text-green-700',
            escalated: 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const exportComplaintsCSV = () => {
        const headers = ['ID', 'Title', 'Category', 'Status', 'Student', 'Created', 'Updated'];
        const rows = complaints.map(c => [
            c._id,
            c.title,
            c.category,
            c.status,
            c.studentName,
            new Date(c.createdAt).toLocaleDateString(),
            new Date(c.updatedAt).toLocaleDateString(),
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(r => r.map(cell => `"${cell}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `complaints-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        addNotification?.({ type: 'success', message: 'Complaints exported successfully' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block">
                        <div className="h-8 w-8 rounded-full border-4 border-gray-300 border-t-blue-600 animate-spin" />
                    </div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-2">System management and complaint oversight</p>
                </div>

                {/* Stats Overview */}
                {activeTab === 'overview' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Total Complaints */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Total Complaints
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {stats.totalComplaints}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">All-time</p>
                                        </div>
                                        <AlertCircle className="h-8 w-8 text-blue-500 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pending Complaints */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Pending
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-yellow-600">
                                                {stats.pendingComplaints}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">In progress</p>
                                        </div>
                                        <Clock className="h-8 w-8 text-yellow-500 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Resolved Complaints */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Resolved
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-green-600">
                                                {stats.resolvedComplaints}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">Completed</p>
                                        </div>
                                        <CheckCircle2 className="h-8 w-8 text-green-500 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Escalated Complaints */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Escalated
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-red-600">
                                                {stats.escalatedComplaints}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">High priority</p>
                                        </div>
                                        <Zap className="h-8 w-8 text-red-500 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* User Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Total Users
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {stats.totalUsers}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">Active users</p>
                                        </div>
                                        <Users className="h-8 w-8 text-purple-500 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Faculty Members
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {stats.totalFaculty}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">Staff</p>
                                        </div>
                                        <Users className="h-8 w-8 text-indigo-500 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}

                {/* Complaints Management */}
                {activeTab === 'complaints' && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Complaint Management</CardTitle>
                                    <CardDescription>
                                        View and manage all complaints in the system
                                    </CardDescription>
                                </div>
                                <Button
                                    onClick={exportComplaintsCSV}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Export
                                </Button>
                            </div>

                            {/* Filters */}
                            <div className="flex gap-4 mt-4 flex-wrap">
                                <div className="flex-1 min-w-[200px]">
                                    <Input
                                        placeholder="Search complaints..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-9"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[180px] h-9">
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="submitted">Submitted</SelectItem>
                                        <SelectItem value="in_review">In Review</SelectItem>
                                        <SelectItem value="need_clarification">Need Clarification</SelectItem>
                                        <SelectItem value="assigned">Assigned</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="escalated">Escalated</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredComplaints.length > 0 ? (
                                            filteredComplaints.map((complaint) => (
                                                <TableRow key={complaint._id}>
                                                    <TableCell className="font-medium truncate max-w-[200px]">
                                                        {complaint.title}
                                                    </TableCell>
                                                    <TableCell className="capitalize">
                                                        {complaint.category}
                                                    </TableCell>
                                                    <TableCell>{complaint.studentName}</TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                                complaint.status
                                                            )}`}
                                                        >
                                                            {complaint.status.replace('_', ' ')}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-600">
                                                        {new Date(complaint.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                navigate(`/faculty-dashboard/complaint/${complaint._id}`)
                                                            }
                                                        >
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8">
                                                    <p className="text-gray-500">No complaints found</p>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <p className="text-sm text-gray-600 mt-4">
                                Showing {filteredComplaints.length} of {complaints.length} complaints
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Users Management */}
                {activeTab === 'users' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>Manage system users and permissions</CardDescription>
                        </CardHeader>

                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Username</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Joined</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.length > 0 ? (
                                            users.map((u) => (
                                                <TableRow key={u._id}>
                                                    <TableCell className="font-medium">{u.name}</TableCell>
                                                    <TableCell>{u.email}</TableCell>
                                                    <TableCell>{u.username}</TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                u.role === 'admin'
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : u.role === 'faculty'
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'bg-green-100 text-green-700'
                                                            }`}
                                                        >
                                                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-600">
                                                        {new Date(u.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="sm">
                                                            Manage
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8">
                                                    <p className="text-gray-500">No users found</p>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <p className="text-sm text-gray-600 mt-4">
                                Total users: {users.length}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Tab Navigation */}
                <div className="flex gap-2 mt-8 mb-6">
                    <Button
                        variant={activeTab === 'overview' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('overview')}
                        className="gap-2"
                    >
                        <BarChart3 className="h-4 w-4" />
                        Overview
                    </Button>
                    <Button
                        variant={activeTab === 'complaints' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('complaints')}
                        className="gap-2"
                    >
                        <MessageSquare className="h-4 w-4" />
                        Complaints
                    </Button>
                    <Button
                        variant={activeTab === 'users' ? 'default' : 'outline'}
                        onClick={() => setActiveTab('users')}
                        className="gap-2"
                    >
                        <Users className="h-4 w-4" />
                        Users
                    </Button>
                </div>
            </div>
        </div>
    );
}
