import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import ComplaintForm, { type Complaint, type ComplaintStatus } from '@/components/ComplaintForm';
import ComplaintList from '@/components/ComplaintList';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, FileText, BarChart3 } from 'lucide-react';

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const { addNotification } = useNotification();

    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [deleteComplaint, setDeleteComplaint] = useState<Complaint | null>(null);

    // Extend Complaint to store display-only date/time for the success popup
    interface SubmittedComplaint extends Complaint {
        date: string;
        time: string;
    }

    const [lastSubmitted, setLastSubmitted] = useState<SubmittedComplaint | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

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

    // Load complaints from localStorage on component mount
    useEffect(() => {
        const savedComplaints = localStorage.getItem('complaints');
        if (savedComplaints) {
            const allComplaints: Complaint[] = JSON.parse(savedComplaints).map(normalize);
            const userComplaints = allComplaints.filter(c => c.studentId === user?.id);
            setComplaints(userComplaints);
        }
    }, [user?.id]);

    const saveComplaintsToStorage = (updatedComplaints: Complaint[]) => {
        const savedComplaints = localStorage.getItem('complaints');
        const allComplaints: Complaint[] = savedComplaints ? JSON.parse(savedComplaints).map(normalize) : [];

        // Remove old complaints by current user and add updated ones
        const otherUsersComplaints = allComplaints.filter(c => c.studentId !== user?.id);
        const newAllComplaints = [...otherUsersComplaints, ...updatedComplaints];

        localStorage.setItem('complaints', JSON.stringify(newAllComplaints));
    };

    const handleComplaintSubmit = (complaint: Complaint) => {
        let updatedComplaints: Complaint[];

        if (editingComplaint) {
            // Update existing complaint
            updatedComplaints = complaints.map(c => (c.id === complaint.id ? complaint : c));
            setEditingComplaint(null);
        } else {
            // Add new complaint
            updatedComplaints = [...complaints, complaint];
        }

        setComplaints(updatedComplaints);
        saveComplaintsToStorage(updatedComplaints);

        // Success notification
        addNotification?.({
            type: 'success',
            message: 'Complaint submitted successfully!',
        });

        // Success popup data
        const now = new Date();
        setLastSubmitted({
            ...complaint,
            date: now.toLocaleDateString('en-GB'), // dd/mm/yyyy
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        setShowSuccess(true);
        setActiveTab('submit');
    };

    const handleComplaintEdit = (complaint: Complaint) => {
        setEditingComplaint(complaint);
        setActiveTab('submit');
    };

    // const handleComplaintDelete = (complaintId: string) => {
    //     const updatedComplaints = complaints.filter(c => c.id !== complaintId);
    //     setComplaints(updatedComplaints);
    //     saveComplaintsToStorage(updatedComplaints);
    // };

    const handleCancelEdit = () => {
        setEditingComplaint(null);
    };

    // Calculate statistics
    const stats = {
        total: complaints.length,
        submitted: complaints.filter(c => c.status === 'submitted').length,
        in_review: complaints.filter(c => c.status === 'in_review').length,
        assigned: complaints.filter(c => c.status === 'assigned').length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Student Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back, <span className="text-black">{user?.name}</span>! Manage your complaints and track their progress.
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 rounded-md">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="submit" className="flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Submit Complaint
                        </TabsTrigger>
                        <TabsTrigger value="my-complaints" className="flex items-center gap-2 rounded-md">
                            <FileText className="h-4 w-4" />
                            My Complaints
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Card className="shadow-card rounded-md">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Complaints</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-card rounded-md">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Submitted</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-600">{stats.submitted}</div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-card rounded-md">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">In Review / Assigned</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-600">{stats.in_review + stats.assigned}</div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-card rounded-md">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-600">{stats.resolved}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Complaints */}
                        <Card className="shadow-card rounded-md">
                            <CardHeader>
                                <CardTitle>Recent Complaints</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {complaints.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground mb-4">You haven't submitted any complaints yet.</p>
                                        <Button onClick={() => setActiveTab('submit')} className="bg-gradient-primary bg-sky-500">
                                            <PlusCircle className="h-4 w-4 mr-2" />
                                            Submit Your First Complaint
                                        </Button>
                                    </div>
                                ) : (
                                    <ComplaintList
                                        complaints={complaints.slice(0, 3)}
                                        onEdit={handleComplaintEdit}
                                        onDelete={(complaint) => setDeleteComplaint(complaint)}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Submit Complaint Tab */}
                    <TabsContent value="submit">
                        <ComplaintForm
                            complaint={editingComplaint || undefined}
                            onSubmit={handleComplaintSubmit}
                            onCancel={editingComplaint ? handleCancelEdit : undefined}
                        />

                        {/* Success Popup */}
                        {showSuccess && lastSubmitted && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                                <div className="bg-white rounded-2xl shadow-xl p-6 w-[340px] text-center relative rounded-md">
                                    <button onClick={() => setShowSuccess(false)} className="absolute top-3 right-3">
                                        <img src='https://cdn-icons-png.flaticon.com/128/2723/2723639.png' height="25" width="25" />
                                    </button>
                                    <div className="flex justify-center mb-4">
                                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                                            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-800">Complaint Submitted</h2>
                                    <p className="text-sm text-gray-500 mb-4">Successfully Recorded</p>
                                    <div className="text-left text-sm space-y-1 border border-gray-300 p-3 rounded-md">
                                        <p><span className="font-medium">Complaint ID:</span> {lastSubmitted.id}</p>
                                        <p><span className="font-medium">Category:</span> {lastSubmitted.category}</p>
                                        <p><span className="font-medium">Date:</span> {lastSubmitted.date}</p>
                                        <p><span className="font-medium">Time:</span> {lastSubmitted.time}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="my-complaints">
                        <ComplaintList
                            complaints={complaints}
                            onEdit={handleComplaintEdit}
                            onDelete={(complaint) => setDeleteComplaint(complaint)}
                            renderExtra={(complaint) =>
                                complaint.attachment ? (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => window.open(complaint.attachment, '_blank')}
                                        className="mb-2"
                                    >
                                        View Attachment
                                    </Button>
                                ) : null
                            }
                        />
                    </TabsContent>

                    {/* Delete Confirmation Popup */}
                    {deleteComplaint && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 rounded-sm">
                            <div className="bg-white rounded-2xl shadow-xl p-6 w-[340px] text-center relative rounded-md">
                                <button onClick={() => setDeleteComplaint(null)} className="absolute top-3 right-3">
                                    <img src='https://cdn-icons-png.flaticon.com/128/2723/2723639.png' height="25" width="25" />
                                </button>
                                <div className="flex justify-center mb-4">
                                    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <h2 className="text-lg font-semibold text-gray-800">Are you sure?</h2>
                                <p className="text-sm text-gray-500 mb-4">You want to delete this complaint</p>
                                <div className="text-left text-sm space-y-1 mb-4 border border-gray-300 p-3 rounded-md">
                                    <p><span className="font-medium">Complaint ID:</span> {deleteComplaint.id}</p>
                                    <p><span className="font-medium">Category:</span> {deleteComplaint.category}</p>
                                    <p><span className="font-medium">Date:</span> {new Date(deleteComplaint.createdAt).toLocaleDateString()}</p>
                                    <p><span className="font-medium">Time:</span> {new Date(deleteComplaint.createdAt).toLocaleTimeString()}</p>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => {
                                            const id = deleteComplaint.id;
                                            setDeleteComplaint(null);
                                            // ensure delete after closing
                                            setTimeout(() => {
                                                const updated = complaints.filter(c => c.id !== id);
                                                setComplaints(updated);
                                                saveComplaintsToStorage(updated);
                                            }, 0);
                                        }}
                                        className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </Tabs>
            </div>
        </div>
    );
};

export default StudentDashboard;
