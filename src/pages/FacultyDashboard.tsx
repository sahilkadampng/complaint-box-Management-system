import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';;
// import ComplaintList from '@/components/ComplaintList';
import SimpleComplaintRow from '@/components/SimpleComplaintRow';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import FacultyLayout from "@/components/FacultyLayout";
import Sidebar from '@/components/Sidebar';
import { FileText, Filter, Download, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Complaint, ComplaintStatus } from '@/components/ComplaintForm';
import { apiClient } from '@/lib/api';
import { Outlet } from "react-router-dom";

const FacultyDashboard: React.FC = () => {
    const { user: _user } = useAuth();
    const { addNotification } = useNotification();
    const navigate = useNavigate();
    const location = useLocation();


    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | ComplaintStatus>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('newest');

    // Clarification dialog state
    const [showClarificationDialog, setShowClarificationDialog] = useState(false);
    const [clarificationMessage, setClarificationMessage] = useState('');
    const [pendingComplaintId, setPendingComplaintId] = useState<string | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalComplaints, setTotalComplaints] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Normalize API complaint to frontend format
    const normalizeComplaint = (apiComplaint: any): Complaint => {
        const created = apiComplaint.createdAt || new Date().toISOString();
        const history = Array.isArray(apiComplaint.history) && apiComplaint.history.length > 0
            ? apiComplaint.history.map((h: any) => ({
                status: h.status,
                date: h.date || created,
            }))
            : [{ status: apiComplaint.status || 'submitted', date: created }];

        // Handle null/undefined studentId safely (typeof null === 'object' in JS)
        const studentIdObj = apiComplaint.studentId;
        let studentIdVal = '';
        if (studentIdObj && typeof studentIdObj === 'object') {
            studentIdVal = studentIdObj._id || studentIdObj.id || '';
        } else if (studentIdObj) {
            studentIdVal = studentIdObj;
        }

        return {
            id: apiComplaint._id || apiComplaint.id || "",
            title: apiComplaint.title || '',
            description: apiComplaint.description || '',
            category: apiComplaint.category || '',
            studentId: studentIdVal,
            studentName: apiComplaint.studentName || (studentIdObj?.name || ''),
            studentUsername: apiComplaint.studentUsername || (studentIdObj?.username || ''),
            createdAt: created,
            status: apiComplaint.status || 'submitted',
            history,
            attachment: apiComplaint.attachment || '',
            department: apiComplaint.department || '',
            yearOfStudy: apiComplaint.yearOfStudy || '',
            clarificationMessage: apiComplaint.clarificationMessage || '',
        };
    };

    useEffect(() => {
        const loadComplaints = async (page = 1, append = false) => {
            try {
                setIsLoadingMore(page > 1);
                const response = await apiClient.getComplaints({ limit: 50, page });

                if (response.error) {
                    const message = response.error;
                    const isAuthError = /unauthorized|token|jwt/i.test(message);
                    addNotification?.({ type: 'error', message: isAuthError ? 'Session expired. Please login again.' : message });
                    if (isAuthError) {
                        navigate('/login', { replace: true });
                    }
                    if (!append) setComplaints([]);
                } else if (response.data) {
                    const normalizedComplaints = response.data.complaints.map(normalizeComplaint);

                    if (append) {
                        setComplaints(prev => [...prev, ...normalizedComplaints]);
                    } else {
                        setComplaints(normalizedComplaints);
                    }

                    // Update pagination info
                    setCurrentPage(response.data.pagination.page);
                    setTotalPages(response.data.pagination.pages);
                    setTotalComplaints(response.data.pagination.total);
                }
            } catch (error) {
                console.error('Error loading complaints:', error);
                addNotification?.({ type: 'error', message: 'Failed to load complaints. Please check your connection or login again.' });
                if (!append) setComplaints([]);
            } finally {
                setIsLoadingMore(false);
            }
        };

        loadComplaints(1, false);
    }, []);

    // Function to load more complaints
    const handleLoadMore = () => {
        if (currentPage < totalPages && !isLoadingMore) {
            const loadComplaints = async (page: number) => {
                try {
                    setIsLoadingMore(true);
                    const response = await apiClient.getComplaints({ limit: 50, page });

                    if (response.error) {
                        addNotification?.({ type: 'error', message: response.error });
                    } else if (response.data) {
                        const normalizedComplaints = response.data.complaints.map(normalizeComplaint);
                        setComplaints(prev => [...prev, ...normalizedComplaints]);
                        setCurrentPage(response.data.pagination.page);
                        setTotalPages(response.data.pagination.pages);
                        setTotalComplaints(response.data.pagination.total);
                    }
                } catch (error) {
                    console.error('Error loading more complaints:', error);
                    addNotification?.({ type: 'error', message: 'Failed to load more complaints' });
                } finally {
                    setIsLoadingMore(false);
                }
            };

            loadComplaints(currentPage + 1);
        }
    };

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

    const handleStatusChange = async (complaintId: string, newStatus: ComplaintStatus, clarificationMsg?: string) => {
        // If status is need_clarification and no message provided yet, show dialog
        if (newStatus === 'need_clarification' && !clarificationMsg) {
            setPendingComplaintId(complaintId);
            setShowClarificationDialog(true);
            return;
        }

        try {
            const response = await apiClient.updateComplaintStatus(complaintId, newStatus, undefined, undefined, clarificationMsg);

            if (response.error) {
                addNotification?.({ type: 'error', message: response.error });
                return;
            }

            if (response.data) {
                const updated = normalizeComplaint(response.data.complaint);
                setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
                addNotification?.({ type: 'success', message: 'Complaint status updated successfully' });

                if (newStatus === 'need_clarification') {
                    addNotification?.({ type: 'info', message: 'Student will be notified about the clarification needed' });
                }
            }
        } catch (error) {
            console.error('Error updating status:', error);
            addNotification?.({ type: 'error', message: 'Failed to update complaint status' });
        }
    };

    const handleClarificationSubmit = () => {
        if (!clarificationMessage.trim()) {
            addNotification?.({ type: 'error', message: 'Please enter a clarification message' });
            return;
        }

        if (pendingComplaintId) {
            handleStatusChange(pendingComplaintId, 'need_clarification', clarificationMessage);
        }

        setShowClarificationDialog(false);
        setClarificationMessage('');
        setPendingComplaintId(null);
    };
    const handleRegisterUser = () => navigate('/register');
    const handleFacultySignup = () => navigate('/faculty-dashboard/faculty-signup');

    const handleExport = () => {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: "a4"
        });

        const now = new Date();
        const formattedDate = now.toLocaleDateString();
        const formattedTime = now.toLocaleTimeString();

        // -------------------- HEADER --------------------
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text("DYPDPU — Complaint Report", 40, 40);

        doc.setFontSize(11);
        doc.setTextColor(90, 90, 90);
        doc.text(`Generated on: ${formattedDate}  ${formattedTime}`, 40, 60);

        // -------------------- TABLE DATA --------------------
        const maskName = (name: string): string => {
            if (!name) return "Unknown";

            // show last 2 characters only
            const visible = name.slice(-2);
            const hidden = "*".repeat(name.length - 2);

            return hidden + visible;
        };

        const truncateText = (text: string, max = 20): string => {
            if (!text) return "";
            return text.length > max ? text.slice(0, max) + "..." : text;
        };

        const tableData = filteredComplaints.map((c) => [
            c.id,
            truncateText(c.title),
            c.category,
            maskName(c.studentName),
            new Date(c.createdAt).toLocaleDateString(),
            c.status.charAt(0).toUpperCase() + c.status.slice(1).replace("_", " ")
        ]);
        autoTable(doc, {
            startY: 80,
            head: [["ID", "Title", "Category", "Student", "Date", "Status"]],
            body: tableData,

            // Modern styling
            theme: "grid",
            headStyles: {
                fillColor: [30, 55, 153],       // Blue header
                textColor: 255,
                fontStyle: "bold",
                fontSize: 12,
            },
            styles: {
                fontSize: 10,
                cellPadding: 6,
                textColor: 60,
                valign: "middle",
            },
            alternateRowStyles: {
                fillColor: [245, 247, 255]      // soft blue tint
            },
            margin: { left: 40, right: 40 },
        });
        const internalDoc: any = (doc as any).internal;
        const pageCount = typeof internalDoc.getNumberOfPages === "function"
            ? internalDoc.getNumberOfPages()
            : 1;
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            doc.setFontSize(10);
            doc.setTextColor(120, 120, 120);
            // Left footer
            doc.text(`Generated on: ${now.toLocaleString()}`, 40, pageHeight - 35);
            doc.text('DYPDPU Complaint Panel', 40, pageHeight - 20);
            // Right aligned page number
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - 80, pageHeight - 20);
        }
        const fileName = `DPU-ComplaintReport(${now.toLocaleTimeString().replace(/:/g, ':')}).pdf`;
        doc.save(fileName);
    };
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
    const categories = Array.from(new Set(complaints.map(c => c.category)));
    const clearFilters = () => {
        setSearchTerm('');
        setFilterStatus('all');
        setFilterCategory('all');
        setSortBy('newest');
    };

    // const checkEscalations = (complaints: Complaint[]): Complaint[] => {
    //     const now = new Date();
    //     return complaints.map(c => {
    //         if (c.status !== "resolved" && c.status !== "escalated" &&
    //             new Date(c.createdAt).getTime() < now.getTime() - 7 * 24 * 60 * 60 * 1000
    //         ) {
    //             return { ...c, status: "escalated" as ComplaintStatus, history: [...c.history, { status: "escalated" as ComplaintStatus, date: new Date().toISOString() }] };
    //         }
    //         return c;
    //     });
    // };

    // useEffect(() => {
    //     const stored = JSON.parse(localStorage.getItem("complaints") || "[]") as Complaint[];
    //     const checked = checkEscalations(stored);
    //     setComplaints(checked);
    //     localStorage.setItem("complaints", JSON.stringify(checked));
    // }, []);

    // Treat every nested route (anything beyond /faculty-dashboard) as a standalone view
    const isChildRoute =
        location.pathname === '/faculty-dashboard/'
            ? false
            : location.pathname.startsWith('/faculty-dashboard/') && location.pathname !== '/faculty-dashboard';

    if (isChildRoute) {
        return (
            <FacultyLayout>
                <div className="font-body flex w-full">
                    <Sidebar />
                    <div className="flex-1 h-screen overflow-y-auto bg-background md:ml-0 ml-0">
                        <Outlet />
                    </div>
                </div>
            </FacultyLayout>
        );
    }
    return (
        <FacultyLayout>
            <div className="font-body flex w-full">
                {/*  */}
                {/* <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-md z-50"> */}
                <Sidebar />
                {/* </div> */}

                {/* Main Content */}
                <div className="flex-1 h-screen overflow-y-auto bg-background md:ml-0 ml-0">
                    <Outlet />
                    {/* Header */}
                    <div className="bg-white text-primary-foreground">
                        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-8">
                            <div className="mb-4 md:mb-0">
                                <h1 className="text-3xl font-bold mb-1 font-body text-black mt-20">Faculty Dashboard</h1>
                                <p className="text-black text-sm md:text-base">Manage and resolve student complaints efficiently</p>
                            </div>
                            <div className="flex flex-wrap gap-2 md:gap-4 mt-4">
                                {/* <Button variant="secondary" size="sm" onClick={() => navigate('/faculty-dashboard/profile')}>
                                    <User className="h-4 w-4 mr-2" /> Profile
                                </Button> */}
                                <Button variant="secondary" size="sm" onClick={handleRegisterUser}>
                                    <Users className="h-4 w-4 mr-2" /> Register New User
                                </Button>
                                <Button variant="secondary" size="sm" onClick={handleFacultySignup} className="bg-blue-500 hover:bg-blue-600 text-white">
                                    <Users className="h-4 w-4 mr-2" /> Add Faculty
                                </Button>
                                <Button variant="secondary" size="sm" onClick={handleExport}>
                                    <Download className="h-4 w-4 mr-2" /> Export Report
                                </Button>
                            </div>
                        </div>
                    </div>
                    <hr className="border-t border-gray-200 mt-[3px]" />

                    {/* Statistics + Filters + Table */}
                    <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 py-6 bg-white min-h-screen rounded-md">
                        <h1 className="mb-4 font-vend text-xl font-bold text-black">Overview</h1>
                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                            <Card className="shadow-card rounded-md">
                                <CardContent className="p-4 sm:p-6">
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
                                <CardContent className="p-4 sm:p-6">
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
                                <CardContent className="p-4 sm:p-6">
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
                                <CardContent className="p-4 sm:p-6">
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

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                            {/* Filters Sidebar */}
                            <div className="col-span-12 lg:col-span-3">
                                <Card className="shadow-card rounded-md sticky top-[70px] max-h-[75vh] overflow-y-auto">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg flex items-center">
                                                <Filter className="h-5 w-5 mr-2" /> Filters
                                            </CardTitle>
                                            <Button variant="outline" size="sm" onClick={clearFilters}>
                                                Clear All
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 sm:space-y-6">
                                        {/* Search */}
                                        <div>
                                            <label className="text-sm font-medium text-foreground mb-1 block">
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
                                            <label className="text-sm font-medium text-foreground mb-1 block">
                                                Category
                                            </label>
                                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All Categories" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Categories</SelectItem>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category} value={category}>
                                                            <div className="flex w-full items-center gap-4">
                                                                <span className="flex-1">{category}</span>
                                                                <Badge className="ml-auto bg-blue-600 text-white border-none shadow-none">
                                                                    {complaints.filter((c) => c.category === category).length}
                                                                </Badge>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Status Filter */}
                                        <div>
                                            <label className="text-sm font-medium text-foreground mb-1 block">
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
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Main Content */}
                            <div className="col-span-12 lg:col-span-9">
                                <Card className="shadow-card rounded-md">
                                    <CardHeader>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                                            <div>
                                                <CardTitle className="text-lg">
                                                    Showing {filteredComplaints.length} of {complaints.length} complaints
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Sort by:{' '}
                                                    {sortBy === 'newest'
                                                        ? 'Newest First'
                                                        : sortBy === 'oldest'
                                                            ? 'Oldest First'
                                                            : 'Title'}
                                                </p>
                                            </div>
                                            <Select value={sortBy} onValueChange={setSortBy}>
                                                <SelectTrigger className="w-full sm:w-40">
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
                                                        ? 'No complaints have been submitted yet.'
                                                        : 'Try adjusting your filters to see more results.'}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="border rounded-md overflow-hidden">

                                                {/* Header Row */}
                                                <div className="grid grid-cols-6 gap-4 py-3 px-4 bg-gray-200 font-semibold text-sm">
                                                    <span>ID</span>
                                                    <span>Title</span>
                                                    <span>Student</span>
                                                    <span>Category</span>
                                                    <span>Status</span>
                                                    {/* <span>Date</span> */}
                                                </div>

                                                {/* Dynamic Rows */}
                                                {filteredComplaints.map((c) => (
                                                    <SimpleComplaintRow
                                                        key={c.id}
                                                        complaint={c}
                                                        onStatusChange={handleStatusChange}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                                {/* Load More Button */}
                                {currentPage < totalPages && (
                                    <div className="flex flex-col items-center gap-3 mt-6 pb-6">
                                        <p className="text-sm text-muted-foreground">
                                            Showing {filteredComplaints.length} of {totalComplaints} complaints
                                        </p>
                                        <Button
                                            onClick={handleLoadMore}
                                            disabled={isLoadingMore}
                                            variant="outline"
                                            className="w-full max-w-md"
                                        >
                                            {isLoadingMore ? (
                                                <>
                                                    <span className="animate-spin mr-2">⏳</span>
                                                    Loading...
                                                </>
                                            ) : (
                                                <>Load More Complaints ({totalComplaints - filteredComplaints.length} remaining)</>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clarification Dialog */}
            <Dialog open={showClarificationDialog} onOpenChange={setShowClarificationDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Request Clarification</DialogTitle>
                        <DialogDescription>
                            Please describe what additional information or clarification is needed from the student.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Clarification Message</label>
                            <Textarea
                                placeholder="Describe what clarification is needed..."
                                value={clarificationMessage}
                                onChange={(e) => setClarificationMessage(e.target.value)}
                                rows={5}
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                The student will see this message and can provide the requested information.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowClarificationDialog(false);
                                setClarificationMessage('');
                                setPendingComplaintId(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleClarificationSubmit}>
                            Submit Clarification Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </FacultyLayout >
    );
};

export default FacultyDashboard;
