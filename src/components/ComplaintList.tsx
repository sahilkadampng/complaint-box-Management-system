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
      case 'submitted': return 'text-yellow-600';
      case 'in_review': return 'text-orange-600';
      case 'assigned': return 'text-blue-600';
      case 'resolved': return 'text-green-600';
      case 'escalated': return 'text-red-600'; // ✅ added
    }
  };

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <Card className="shadow-card">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search complaints..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Select value={filterStatus} onValueChange={(value: FilterStatus) => setFilterStatus(value)}>
                                <SelectTrigger className="w-44">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="submitted">Submitted</SelectItem>
                                    <SelectItem value="in_review">In Review</SelectItem>
                                    <SelectItem value="assigned">Assigned</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="escalated">Escalated</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger className="w-40">
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
                            className="shadow-card hover:shadow-hover transition-all duration-200"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">{complaint.title}</CardTitle>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                            <span>ID: {complaint.id}</span>
                                            <span>Category: {complaint.category}</span>
                                            <span>Date: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                                            {user?.role === 'faculty' && (
                                                <span>Student: {maskText(complaint.studentName)}</span>
                                            )}
                                        </div>
                                    </div>
                                    <Badge
                                        variant={badgeVariant(complaint.status)}
                                        className={`${badgeClass(complaint.status)} font-medium`}
                                    >
                                        {statusLabel[complaint.status]}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <p className="text-foreground mb-4 leading-relaxed">{complaint.description}</p>

                                {/* Optional extra content hook */}
                                {renderExtra && renderExtra(complaint)}

                                {/* Attachment Preview */}
                                {complaint.attachment && (
                                    <div className="mt-3">
                                        {complaint.attachment.startsWith("data:application/pdf") ? (
                                            <a
                                                href={complaint.attachment}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 underline text-sm"
                                            >
                                                📄 View PDF Attachment
                                            </a>
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
                                    <ComplaintTimeline history={complaint.history} />
                                )}

                                {showActions && (
                                    <div className="flex justify-between items-center pt-4 border-t border-border">
                                        <div className="flex gap-2 items-center">
                                            {user?.role === 'faculty' && (
                                                <>
                                                    {/* Direct status selector for admins/faculty */}
                                                    <Select
                                                        value={complaint.status}
                                                        onValueChange={(value: ComplaintStatus) =>
                                                            handleStatusChange(complaint.id, value)
                                                        }
                                                    >
                                                        <SelectTrigger className="w-40 h-8">
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
                                                        onClick={() => handleDownloadPDF(complaint)}
                                                        className="h-8"
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
                                                            onClick={() => onEdit(complaint)}
                                                            className="h-8"
                                                        >
                                                            <Edit className="h-4 w-4 mr-1" />
                                                            Edit
                                                        </Button>
                                                    )}
                                                    {onDelete && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => onDelete(complaint)}
                                                            className="h-8 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-1" />
                                                            Delete
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        <span className="text-xs text-muted-foreground">
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
