import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ComplaintList from '@/components/ComplaintList';
import Navbar from '@/components/Navbar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    FileText,
    Filter,
    Download,
    Users,
    CheckCircle,
    AlertTriangle,
} from 'lucide-react';
import type { Complaint, ComplaintStatus } from '@/components/ComplaintForm';

const FacultyDashboard: React.FC = () => {
    const { user: _user } = useAuth();
    const navigate = useNavigate();

    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | ComplaintStatus>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('newest');

    // normalize legacy data (old "pending"/"resolved", no history)
    const normalize = (c: any): Complaint => {
        const created = c.createdAt ?? new Date().toISOString();
        let status: ComplaintStatus;
        if (c.status === 'pending') status = 'in_review';
        else if (c.status === 'resolved') status = 'resolved';
        else if (['submitted', 'in_review', 'assigned', 'resolved'].includes(c.status)) status = c.status;
        else status = 'submitted';

        const history: any[] = Array.isArray(c.history) && c.history.length > 0
            ? c.history
            : [{ status: 'submitted', date: created }];

        // ensure current status exists in history
        if (!history.find(h => h.status === status)) {
            history.push({ status, date: created });
        }

        return {
            ...c,
            createdAt: created,
            status,
            history,
        } as Complaint;
    };

    // Load all complaints from localStorage on component mount
    useEffect(() => {
        const savedComplaints = localStorage.getItem('complaints');
        if (savedComplaints) {
            const allComplaints: Complaint[] = JSON.parse(savedComplaints).map(normalize);
            setComplaints(allComplaints);
        }
    }, []);

    // Filter and sort complaints
    useEffect(() => {
        let filtered = complaints.filter(complaint => {
            const matchesSearch =
                complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                complaint.studentId.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
            const matchesCategory = filterCategory === 'all' || complaint.category === filterCategory;

            return matchesSearch && matchesStatus && matchesCategory;
        });

        // Sort complaints
        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'title':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }

        setFilteredComplaints(filtered);
    }, [complaints, searchTerm, filterStatus, filterCategory, sortBy]);

    const saveComplaintsToStorage = (updatedComplaints: Complaint[]) => {
        localStorage.setItem('complaints', JSON.stringify(updatedComplaints));
    };

    const handleStatusChange = (complaintId: string, newStatus: ComplaintStatus) => {
        const updatedComplaints = complaints.map(complaint =>
            complaint.id === complaintId
                ? {
                    ...complaint,
                    status: newStatus,
                    history: [
                        ...complaint.history,
                        { status: newStatus, date: new Date().toISOString() }
                    ]
                }
                : complaint
        );

        setComplaints(updatedComplaints);
        saveComplaintsToStorage(updatedComplaints);
    };

    const handleRegisterUser = () => navigate('/register');

    const handleExport = () => {
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(20);
        doc.text('DYPDPU Complaint Report', 14, 22);

        // Add generation date
        doc.setFontSize(12);
        doc.text(`Downloaded on: ${new Date().toLocaleDateString()}`, 14, 32);
        doc.text(`(${new Date().toLocaleTimeString()})`, 68, 32);

        // Prepare table data
        const tableData = filteredComplaints.map(complaint => [
            complaint.id,
            complaint.title,
            complaint.category,
            complaint.studentId,
            new Date(complaint.createdAt).toLocaleDateString(),
            complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1).replace('_', ' ')
        ]);

        // Add table
        doc.setFont("arial");
        autoTable(doc, {
            head: [['ID', 'Title', 'Category', 'Student', 'Date', 'Status']],
            body: tableData,
            startY: 40,
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });
        const pageHeight = (doc as any).internal.pageSize.height;
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, pageHeight - 20);
        doc.text('DYPDPU Complaint Panel', 20, pageHeight - 10);

        // Save the PDF
        doc.save(`DPU-ComplaintReport(${new Date().toLocaleTimeString()}).pdf`);
    };

    // Calculate statistics
    const stats = {
        total: complaints.length,
        submitted: complaints.filter(c => c.status === 'submitted').length,
        in_review: complaints.filter(c => c.status === 'in_review').length,
        assigned: complaints.filter(c => c.status === 'assigned').length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
        students: new Set(complaints.map(c => c.studentId)).size,
        resolutionRate: complaints.length > 0
            ? Math.round((complaints.filter(c => c.status === 'resolved').length / complaints.length) * 100)
            : 0
    };

    // Get categories for filter
    const categories = Array.from(new Set(complaints.map(c => c.category)));

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setFilterStatus('all');
        setFilterCategory('all');
        setSortBy('newest');
    };

    // Auto-escalate complaints older than 7 days
    const checkEscalations = (complaints: Complaint[]): Complaint[] => {
        const now = new Date();
        return complaints.map(c => {
            if (
                c.status !== "resolved" &&
                c.status !== "escalated" &&
                new Date(c.createdAt).getTime() < now.getTime() - 7 * 24 * 60 * 60 * 1000
            ) {
                return {
                    ...c,
                    status: "escalated" as ComplaintStatus,
                    history: [
                        ...c.history,
                        { status: "escalated" as ComplaintStatus, date: new Date().toISOString() }
                    ],
                };
            }
            return c;
        });
    };

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("complaints") || "[]") as Complaint[];
        const checked = checkEscalations(stored);
        setComplaints(checked);
        localStorage.setItem("complaints", JSON.stringify(checked));
    }, []);


    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Header */}
            <div className="bg-white text-primary-foreground">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="bg-white text-primary-foreground p-8 items-center justify-between">
                        <h1 className="text-2xl font-bold mb-1 text-black">Faculty Dashboard</h1>
                        <p className="text-black">Manage and resolve student complaints efficiently</p>
                    </div>
                    <div className="flex items-center space-x-4 pr-8">
                        <Button variant="secondary" size="sm" onClick={handleRegisterUser}>
                            <Users className="h-4 w-4 mr-2" />
                            Register New User
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleExport}>
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
                            }}
                        >
                            Clear Local Data
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 rounded-md">
                    <Card className="shadow-card rounded-md">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Complaints</p>
                                    <p className="text-xl font-bold text-foreground">{stats.total}</p>
                                </div>
                                <FileText className="h-4 w-4 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-card rounded-md">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                                    <p className="text-xl font-bold text-foreground">{stats.submitted}</p>
                                </div>
                                <AlertTriangle className="h-4 w-4 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-card rounded-md">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">In Review / Assigned</p>
                                    <p className="text-xl font-bold text-foreground">{stats.in_review + stats.assigned}</p>
                                </div>
                                <AlertTriangle className="h-4 w-4 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-card rounded-md">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Resolved (Rate)</p>
                                    <p className="text-xl font-bold text-foreground">
                                        {stats.resolved} ({stats.resolutionRate}%)
                                    </p>
                                </div>
                                <CheckCircle className="h-4 w-4 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-12 gap-6 rounded-md">
                    {/* Filters Sidebar */}
                    <div className="col-span-12 lg:col-span-3">
                        <Card className="shadow-card rounded-md">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center">
                                        <Filter className="h-5 w-5 mr-2" />
                                        Filters
                                    </CardTitle>
                                    <Button variant="outline" size="sm" onClick={clearFilters}>
                                        Clear All
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Search */}
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">
                                        Search complaints...
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Search by title, description, or ID"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                {/* Category Filter */}
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">
                                        Category
                                    </label>
                                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map(category => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                    <Badge variant="secondary" className="ml-2">
                                                        {complaints.filter(c => c.category === category).length}
                                                    </Badge>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">
                                        Status
                                    </label>
                                    <Select value={filterStatus} onValueChange={setFilterStatus as any}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="submitted">Submitted</SelectItem>
                                            <SelectItem value="in_review">In Review</SelectItem>
                                            <SelectItem value="assigned">Assigned</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                            <SelectItem value="escalated">Escalated</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Separator />

                                {/* Date Range - placeholder */}
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">
                                        Date Range
                                    </label>
                                    <div className="grid grid-cols-1 gap-2">
                                        <Input type="date" placeholder="From Date" />
                                        <Input type="date" placeholder="To Date" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="col-span-12 lg:col-span-9">
                        <Card className="shadow-card rounded-md">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">
                                            Showing {filteredComplaints.length} of {complaints.length} complaints
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Sort by: {sortBy === 'newest' ? 'Newest First' : sortBy === 'oldest' ? 'Oldest First' : 'Title'}
                                        </p>
                                    </div>
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="newest">Newest First</SelectItem>
                                            <SelectItem value="oldest">Oldest First</SelectItem>
                                            <SelectItem value="title">Title</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {filteredComplaints.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-foreground mb-2">No complaints found</h3>
                                        <p className="text-muted-foreground">
                                            {complaints.length === 0
                                                ? "No complaints have been submitted yet."
                                                : "Try adjusting your filters to see more results."
                                            }
                                        </p>
                                    </div>
                                ) : (
                                    <ComplaintList
                                        complaints={filteredComplaints}
                                        onStatusChange={handleStatusChange}
                                        showActions={true}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
