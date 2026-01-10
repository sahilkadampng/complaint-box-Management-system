import { useNavigate } from "react-router-dom";
import { useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Trash2, Download, Search, Filter } from 'lucide-react';
import { generateComplaintPDF } from '@/utils/pdfGenerator';
import type { Complaint, ComplaintStatus } from './ComplaintForm';
import ComplaintTimeline from '@/pages/ComplaintTimeline';

interface ComplaintListProps {
    complaints: Complaint[];
    onEdit?: (complaint: Complaint) => void;
    onDelete?: (complaint: Complaint) => void;
    onStatusChange?: (complaintId: string, status: ComplaintStatus) => void;
    showActions?: boolean;
    renderExtra?: (complaint: Complaint) => React.ReactNode;
}

type FilterStatus = 'all' | ComplaintStatus;

// Utility to mask text (keeps last 2 characters visible)
function maskText(text: string) {
    if (!text) return "";
    if (text.length <= 2) return "*".repeat(text.length);
    const visible = text.slice(-2);
    const hidden = "*".repeat(text.length - 2);
    return hidden + visible;
}

const statusLabel: Record<ComplaintStatus, string> = {
    submitted: "Submitted",
    in_review: "In Review",
    assigned: "Assigned",
    resolved: "Resolved",
    escalated: "Escalated",
};

const ComplaintList: React.FC<ComplaintListProps> = ({
    complaints,
    onEdit,
    onDelete,
    onStatusChange,
    showActions = true,
    renderExtra
}) => {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');

    const categories = useMemo(
        () => Array.from(new Set(['all', ...complaints.map(c => c.category)])),
        [complaints]
    );

    // Filter complaints
    const filteredComplaints = complaints.filter(complaint => {
        const matchesSearch =
            complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.studentName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
        const matchesCategory = filterCategory === 'all' || complaint.category === filterCategory;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    const handleDownloadPDF = (complaint: Complaint) => {
        try {
            generateComplaintPDF({
                id: complaint.id,
                title: complaint.title,
                description: complaint.description,
                studentName: complaint.studentName,
                studentUsername: complaint.studentUsername,
                category: complaint.category,
                createdAt: complaint.createdAt,
                status: statusLabel[complaint.status]
            });

            addNotification?.({
                type: 'success',
                message: 'PDF downloaded successfully!'
            });
        } catch {
            addNotification?.({
                type: 'error',
                message: 'Failed to generate PDF. Please try again.'
            });
        }
    };

    const handleStatusChange = (complaintId: string, newStatus: ComplaintStatus) => {
        if (onStatusChange) {
            onStatusChange(complaintId, newStatus);
            addNotification?.({
                type: 'success',
                message: `Status updated to ${statusLabel[newStatus]}`
            });
        }
    };

    const badgeVariant = (status: ComplaintStatus) =>
        status === 'resolved' ? 'default' : 'secondary';

    const badgeClass = (status: ComplaintStatus) => {
        switch (status) {
            case 'submitted': return 'text-black-800';
            case 'in_review': return 'text-black-600';
            case 'assigned': return 'text-black-800';
            case 'resolved': return 'text-black-600';
            case 'escalated': return 'text-black-600';
        }
    };

    return (
        <div className="space-y-6 font-body">
            {/* Search and Filters */}
            <Card className="shadow-card">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search complaints..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <Select value={filterStatus} onValueChange={(value: FilterStatus) => setFilterStatus(value)}>
                                <SelectTrigger className="w-full sm:w-44">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        value="all"
                                        className="data-[highlighted]:bg-gray-100 data-[highlighted]:text-black transition-colors duration-150"
                                    >
                                        All Status
                                    </SelectItem>
                                    <SelectItem
                                        value="submitted"
                                        className="data-[highlighted]:bg-gray-100 data-[highlighted]:text-black transition-colors duration-150"
                                    >
                                        Submitted
                                    </SelectItem>
                                    <SelectItem
                                        value="in_review"
                                        className="data-[highlighted]:bg-gray-100 data-[highlighted]:text-black transition-colors duration-150"
                                    >
                                        In Review
                                    </SelectItem>
                                    <SelectItem
                                        value="assigned"
                                        className="data-[highlighted]:bg-gray-100 data-[highlighted]:text-black transition-colors duration-150"
                                    >
                                        Assigned
                                    </SelectItem>
                                    <SelectItem
                                        value="resolved"
                                        className="data-[highlighted]:bg-gray-100 data-[highlighted]:text-black transition-colors duration-150"
                                    >
                                        Resolved
                                    </SelectItem>
                                    <SelectItem
                                        value="escalated"
                                        className="data-[highlighted]:bg-gray-100 data-[highlighted]:text-black transition-colors duration-150"
                                    >
                                        Escalated
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger className="w-full sm:w-40">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category === 'all' ? 'All Categories' : category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Complaints List */}
            <div className="space-y-4">
                {filteredComplaints.length === 0 ? (
                    <Card className="shadow-card">
                        <CardContent className="pt-6">
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">
                                    {complaints.length === 0
                                        ? 'No complaints found.'
                                        : 'No complaints match your search criteria.'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    filteredComplaints.map((complaint) => (
                        <Card
                            key={complaint.id}
                            className="shadow-card hover:shadow-hover transition-all duration-200 cursor-pointer"
                            onClick={() => navigate(`/complaint/${complaint.id}`)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    {/* Left side: Title + Meta */}
                                    <div className="space-y-1">
                                        <CardTitle className="text-base sm:text-lg break-words">
                                            {complaint.title}
                                        </CardTitle>
                                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                                            <span>ID: {complaint.id}</span>
                                            <span>Category: {complaint.category}</span>
                                            <span>Date: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                                            {user?.role === 'faculty' && (
                                                <span>Student: {maskText(complaint.studentName)}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right side: Status Badge */}
                                    <div className="shrink-0">
                                        <Badge
                                            variant={badgeVariant(complaint.status)}
                                            className={`${badgeClass(complaint.status)} font-medium flex items-center px-3 py-1 rounded-full text-[10px] sm:text-xs`}
                                        >
                                            {statusLabel[complaint.status]}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-foreground mb-4 leading-relaxed break-words">
                                    {complaint.description}
                                </p>

                                {/* Optional extra content hook */}
                                {renderExtra && renderExtra(complaint)}

                                {/* Attachment Preview */}
                                {complaint.attachment && (
                                    <div className="mt-3">
                                        {complaint.attachment.startsWith("data:application/pdf") ? (
                                            <div className="flex items-center space-x-2">
                                                <a
                                                    href={complaint.attachment}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 text-sm break-words"
                                                >
                                                    View PDF Attachment
                                                </a>
                                            </div>

                                        ) : (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <img
                                                        src={complaint.attachment}
                                                        alt="Attachment"
                                                        className="max-h-40 rounded-md mt-2 border cursor-pointer hover:opacity-80 transition"
                                                    />
                                                </DialogTrigger>
                                                <DialogContent className="max-w-lg">
                                                    <img
                                                        src={complaint.attachment}
                                                        alt="Attachment Preview"
                                                        className="w-full h-auto rounded-md"
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </div>
                                )}

                                {/* Timeline */}
                                {complaint.history && complaint.history.length > 0 && (
                                    <div className="overflow-x-auto">
                                        <div className="flex items-center space-x-8 min-w-max px-0 py-1">
                                            <ComplaintTimeline history={complaint.history} />
                                        </div>
                                    </div>
                                )}
                                {showActions && (
                                    <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-border">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {user?.role === 'faculty' && (
                                                <>
                                                    <Select
                                                        value={complaint.status}
                                                        onValueChange={(value: ComplaintStatus) =>
                                                            handleStatusChange(complaint.id, value)
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            className="w-full sm:w-40 h-8"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="submitted">Submitted</SelectItem>
                                                            <SelectItem value="in_review">In Review</SelectItem>
                                                            <SelectItem value="assigned">Assigned</SelectItem>
                                                            <SelectItem value="resolved">Resolved</SelectItem>
                                                            <SelectItem value="escalated">Escalated</SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownloadPDF(complaint);
                                                        }}
                                                        className="h-8 w-full sm:w-auto"
                                                    >
                                                        <Download className="h-4 w-4 mr-1" />
                                                        PDF
                                                    </Button>
                                                </>
                                            )}

                                            {user?.role === 'student' && complaint.status !== 'resolved' && (
                                                <>
                                                    {onEdit && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEdit?.(complaint);
                                                            }}
                                                            className="h-8 w-full sm:w-auto"
                                                        >
                                                            <Edit className="h-4 w-4 mr-1" />
                                                            Edit
                                                        </Button>
                                                    )}
                                                    {onDelete && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDelete?.(complaint);
                                                            }}
                                                            className="h-8 w-full sm:w-auto text-destructive hover:text-destructive-foreground hover:bg-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-1" />
                                                            Delete
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        <span className="text-xs text-muted-foreground self-end sm:self-center">
                                            {new Date(complaint.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default ComplaintList;
