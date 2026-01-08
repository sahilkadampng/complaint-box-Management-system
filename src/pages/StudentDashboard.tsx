import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import ComplaintForm, { type Complaint, type ComplaintStatus } from '@/components/ComplaintForm';
import ComplaintList from '@/components/ComplaintList';
// import Navbar from '@/components/Navbar';
import StudentSidebar from '@/components/StudentSidebar';
import { Shield } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from "@/components/ui/label";
import jsPDF from "jspdf";
import { PlusCircle, FileText, BarChart3 } from 'lucide-react';
import logo from '@/assets/DYPDPUUnitechsocietylogo1.png' // adjust path

// === Illustrations (add your images to src/assets/) ===
import studentIllustration from '@/assets/completed-steps-animate.svg';
import submitIllustration from '@/assets/completed-steps-animate.svg';
import decorBottomLeft from '@/assets/completed-steps-animate.svg';
import decorBottomright from '@/assets/completed-steps-animate.svg';
// ======================================================

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

    // PDF Generation (unchanged)
    const downloadComplaintPDF = (complaint: Complaint) => {
        const doc = new jsPDF();
        const now = new Date();

        const formattedDate = now.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
        const formattedTime = now.toLocaleTimeString();

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let y = 20;
        let x = 20;

        // ===== Header =====
        // doc.setFont("helvetica", "bold");
        // doc.setFontSize(20);
        // doc.setTextColor(151, 41, 40);
        // const headerText = "DYPDPU Complaint Panel";
        // const textWidth = doc.getTextWidth(headerText);
        // doc.text(headerText, (pageWidth - textWidth) / 2, y);
        // y += 20;

        const imgWidth = 40;   // desired image width
        const imgHeight = 20;  // desired image height

        const a = (pageWidth - imgWidth) / 2; // center horizontally
        const yLogo = 10;                      // distance from top

        doc.addImage(logo, "PNG", a, yLogo, imgWidth, imgHeight, undefined, 'FAST');
        const text = "Dr.D.Y.Patil Arts, Commerce & Science College, Pimpri";

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(151, 41, 40);

        const textWidth = doc.getTextWidth(text);
        const b = (pageWidth - textWidth) / 2; // center horizontally
        const yHeader = yLogo + imgHeight + 10; // below logo

        doc.text(text, b, yHeader); // slightly below logo

        // Move date below the logo
        const yDate = yLogo + imgHeight + 30; // 10 units of spacing below logo

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`${formattedDate}`, 20, yDate);

        // Update y for rest of content
        y = yDate + 2; // leave some spacing for the following text


        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(0);
        y += 15;
        x += 0;
        ;

        y += 5;

        // ===== Thank-You Letter Section =====

        let yPosition = y; // current y position in your PDF

        // Split message into parts
        const messageParts: { text: string; color: [number, number, number] }[] = [
            { text: "Thank you ", color: [30, 64, 175] },
            { text: complaint.studentName, color: [0, 0, 0] }, // highlighted name
            { text: `for submitting your complaint `, color: [30, 64, 175] },
            { text: `Your concern has been successfully received and logged in our system. Your complaint ID: `, color: [30, 64, 175] },
            { text: complaint.id, color: [0, 0, 0] }, // highlighted complaint id
            {
                text: `track your complaint using this ID.

Our team will carefully review the details you provided and take the necessary steps to address the issue. We are committed to ensuring that every complaint is handled promptly and fairly, and you will be kept informed about any updates or resolutions regarding your submission.

Your feedback is invaluable to us, and we appreciate your patience and cooperation. Please rest assured that we take all complaints seriously and strive to maintain a safe, fair, and responsive environment for all students. If you have any further information or additional concerns, you are welcome to update your submission at any time.

We also encourage you to reach out to our support team if you require any guidance, have questions regarding the complaint process, or need assistance in providing further details. Our goal is to maintain transparency and accountability at every step, ensuring that your concerns are addressed effectively and in a timely manner.

Thank you for helping us improve our institution and services. Your involvement plays a crucial role in shaping a positive and responsible community.`, color: [30, 64, 175]
            },
        ];

        // Print each part
        messageParts.forEach(part => {
            doc.setTextColor(...part.color);
            const splitText = doc.splitTextToSize(part.text, pageWidth - 40);
            doc.text(splitText, 20, yPosition);
            yPosition += splitText.length * 7; // adjust line spacing
        });

        // Reset color if needed
        doc.setTextColor(0, 0, 0);

        // ===== Footer =====
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text("DYPDPU Complaint Panel", 20, pageHeight - 15);
        doc.text(`Page 1 of 1`, pageWidth - 30, pageHeight - 15);
        doc.text(`${formattedDate} ${formattedTime}`, 20, pageHeight - 8);

        // ===== Save PDF =====
        doc.save(`complaint-${complaint.id}.pdf`);
    };

    return (
        <div className="font-vend flex w-full">
            {/* // made 'relative' so decorative absolute images position correctly — layout & logic unchanged */}
            {/* <div className="min-h-screen bg-background relative"> */}
                <StudentSidebar />

                {/* Decorative/illustration images (purely visual, hidden on small screens) */}
                <img
                    src={studentIllustration}
                    alt="Student decor"
                    className="hidden md:block pointer-events-none absolute left-6 top-28 w-56 opacity-10 select-none z-0"
                />
                <img
                    src={submitIllustration}
                    alt="Submit decor"
                    className="hidden md:block pointer-events-none absolute right-6 top-28 w-56 opacity-10 select-none z-0"
                />
                <img
                    src={decorBottomLeft}
                    alt="Decor bottom left"
                    className="hidden md:block pointer-events-none absolute left-8 bottom-8 w-56 opacity-10 select-none"
                />
                <img
                    src={decorBottomright}
                    alt="Decor bottom left"
                    className="hidden md:block pointer-events-none absolute right-8 bottom-8 w-56 opacity-10 select-none"
                />

                <div className="max-w-7xl mx-auto px- sm:px-2 lg:px-8 py-10 p-4">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-3 mt-10">Student Dashboard</h1>
                        <p className="text-muted-foreground">
                            Welcome back, <span className="text-black">{user?.name}!!</span> Manage your complaints and track their progress.
                        </p>
                    </div>

                    <Alert className="mb-6">
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                            <p className='text-lg text-gray-600 font-bold'>Anonymous & Secure:</p> <p className='text-gray-600'>Your personal information will not be stored or shared. Only
                                authorized DPU Computer Application department personnel can view complaint details.</p>
                        </AlertDescription>
                    </Alert>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 rounded-md">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="overview" className="flex items-center gap-2 text-sm">
                                <BarChart3 className="h-4 w-4" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="submit" className="flex items-center gap-2 text-sm">
                                <PlusCircle className="h-4 w-4" />
                                Submit
                            </TabsTrigger>
                            <TabsTrigger value="my-complaints" className="flex items-center gap-2 rounded-md text-sm">
                                <FileText className="h-4 w-4" />
                                Complaints
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
                                            {/* small decorative illustration for empty state */}
                                            <img
                                                src={studentIllustration}
                                                alt="No complaints illustration"
                                                className="mx-auto mb-4 w-36 opacity-10 hidden md:block"
                                            />
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
                                <div className="fixed inset-0 flex items-center justify-center bg-green-100 z-50 p-4">
                                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">

                                        {/* Close Button */}
                                        <button
                                            onClick={() => setShowSuccess(false)}
                                            className="absolute top-4 right-4 focus:outline-none"
                                        >
                                            <img
                                                src="https://cdn-icons-png.flaticon.com/128/2723/2723639.png"
                                                height="25"
                                                width="25"
                                                alt="Close"
                                            />
                                        </button>

                                        {/* Success Icon */}
                                        <div className="flex justify-center mb-4">
                                            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                                                <svg
                                                    className="h-10 w-10 text-green-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth={3}
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Title & Description */}
                                        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                                            Complaint Submitted Successfully
                                        </h2>
                                        <p className="text-gray-600 text-center mb-4">
                                            Your complaint has been securely submitted and will be reviewed by authorized DPU personnel within 3-5 business days.
                                        </p>

                                        {/* Alert Section */}
                                        <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                            <Shield className="h-5 w-5 text-green-600 mt-1" />
                                            <p className="text-sm text-green-700">
                                                <strong>Your identity is completely protected.</strong> This complaint is 100% anonymous and secure.
                                            </p>
                                        </div>

                                        {/* Anonymous Tracking ID */}
                                        <div className="space-y-1 mb-4">
                                            <Label className="text-gray-800 font-medium">Tracking ID</Label>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm px-3 py-1 bg-gray-200 text-black rounded">
                                                    {lastSubmitted.id}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Save this Anonymous ID for future reference. You can use it to check the status of your complaint.
                                            </p>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h4 className="font-medium text-blue-800 mb-2">What happens next?</h4>
                                            <ul className="text-sm text-blue-700 space-y-1">
                                                <li>• Your complaint will be reviewed by authorized DPU staff</li>
                                                <li>• Initial review within 3-5 business days</li>
                                                <li>• Status updates will be available in the system</li>
                                                <li>• All communication remains anonymous</li>
                                            </ul>
                                        </div>

                                        {/* Download Receipt Button */}
                                        <button
                                            onClick={() => downloadComplaintPDF(lastSubmitted!)}
                                            className="px-6 py-2 rounded-md bg-gray-600 text-white font-semibold hover:bg-gray-700 mt-5 "
                                        >
                                            Download Receipt
                                        </button>
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
                            <div className="fixed inset-0 flex items-center justify-center bg-red-100 z-50 p-4">
                                <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">

                                    {/* Close Button */}
                                    <button
                                        onClick={() => setDeleteComplaint(null)}
                                        className="absolute top-4 right-4 focus:outline-none"
                                    >
                                        <img
                                            src="https://cdn-icons-png.flaticon.com/128/2723/2723639.png"
                                            height="25"
                                            width="25"
                                            alt="Close"
                                        />
                                    </button>

                                    {/* Warning Icon */}
                                    <div className="flex justify-center mb-4">
                                        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
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

                                    {/* Title & Description */}
                                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                                        Delete Complaint
                                    </h2>
                                    <p className="text-gray-600 text-center mb-4">
                                        Are you sure you want to delete this complaint? This action cannot be undone.
                                    </p>

                                    {/* Complaint Info */}
                                    <div className="text-left text-sm space-y-1 mb-4 border border-gray-300 p-3 rounded-md">
                                        <p><span className="font-medium">Complaint ID:</span> {deleteComplaint.id}</p>
                                        <p><span className="font-medium">Date:</span> {new Date(deleteComplaint.createdAt).toLocaleDateString()}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-3 mt-4">
                                        <button
                                            onClick={() => {
                                                const id = deleteComplaint.id;
                                                setDeleteComplaint(null);
                                                setTimeout(() => {
                                                    const updated = complaints.filter(c => c.id !== id);
                                                    setComplaints(updated);
                                                    saveComplaintsToStorage(updated);
                                                }, 0);
                                            }}
                                            className="w-full px-4 py-2 rounded-md bg-red-500 text-white font-semibold"
                                        >
                                            Delete Complaint
                                        </button>
                                        <button
                                            onClick={() => setDeleteComplaint(null)}
                                            className="w-full px-4 py-2 rounded-md bg-gray-200 text-gray-800 font-semibold"
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                    <div className="bg-red-100 border border-red-200 rounded-lg p-4 mt-6 text-left">
                                        <h4 className="font-medium text-red-800 mb-2">Important Notice:</h4>
                                        <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                                            <li>Deleted complaints cannot be recovered.</li>
                                            <li>Ensure you really want to delete this complaint before proceeding.</li>
                                            <li>All records related to this complaint will be removed permanently.</li>
                                        </ul>
                                    </div>

                                </div>
                            </div>
                        )}
                    </Tabs>
                </div>
            </div>
        // </div>
    );
};

export default StudentDashboard;
