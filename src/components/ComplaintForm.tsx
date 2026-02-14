import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FileUpload from '@/pages/Form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Notebook,
    Building2,
    GraduationCap,
    BookOpen,
    Utensils,
    Bus,
    Wallet,
    Computer,
    Wrench,
    CheckSquare,
    CalendarCheck,
    Shield,
    Wifi,
    Search,
    Landmark
} from "lucide-react";


export type ComplaintStatus =
    "submitted" | "in_review" | "need_clarification" | "assigned" | "resolved" | "escalated";

export interface ComplaintHistory {
    status: ComplaintStatus;
    date: string;
}

export interface Complaint {
    id: string;
    title: string;
    description: string;
    category: string;
    studentId: string;
    studentName: string;
    studentUsername: string;
    createdAt: string;
    status: ComplaintStatus;
    history: ComplaintHistory[];
    attachment?: string;
    attachmentFile?: File; // Raw file for upload (not saved; used only during submission)
    department?: string;
    yearOfStudy?: string;
    isRead?: boolean;
    readBy?: string[];
    clarificationMessage?: string;
}

interface ComplaintFormProps {
    complaint?: Complaint;
    onSubmit: (complaint: Complaint) => void;
    onCancel?: () => void;
}

const ComplaintForm: React.FC<ComplaintFormProps> = ({ complaint, onSubmit, onCancel }) => {
    const { user } = useAuth();
    const { addNotification } = useNotification();

    const [formData, setFormData] = useState({
        title: complaint?.title || '',
        description: complaint?.description || '',
        category: complaint?.category || '',
        attachment: complaint?.attachment || '',
        department: complaint?.department || '',
        yearOfStudy: complaint?.yearOfStudy || ''
    });

    const [uploadedFile, setUploadedFile] = useState<File | null>(null); // store file object
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = [
        { name: "Exam", icon: Notebook },
        { name: "Hostel", icon: Building2 },
        { name: "Academics", icon: GraduationCap },
        { name: "Library", icon: BookOpen },
        { name: "Canteen", icon: Utensils },
        { name: "Transport", icon: Bus },
        { name: "Fees", icon: Wallet },
        { name: "IT Support", icon: Computer },
        { name: "Maintenance", icon: Wrench },
        { name: "Attendance", icon: CheckSquare },
        { name: "Events", icon: CalendarCheck },
        { name: "Security", icon: Shield },
        { name: "WiFi", icon: Wifi },
        // { name: "Cleanliness", icon: Broom },
        { name: "Lost & Found", icon: Search },
        { name: "Administration", icon: Landmark },
    ];


    // Handle input changes
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
            if (!allowed.includes(file.type)) {
                addNotification?.({ type: 'error', message: 'Only JPG, PNG, WebP, and PDF files are allowed.' });
                return;
            }
            // Validate size (10 MB)
            if (file.size > 10 * 1024 * 1024) {
                addNotification?.({ type: 'error', message: 'File size must be under 10 MB.' });
                return;
            }
            setUploadedFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
            addNotification?.({ type: 'error', message: 'Please fill in all required fields' });
            return;
        }

        setIsSubmitting(true);

        try {
            const nowISO = new Date().toISOString();

            const complaintData: Complaint = {
                id: complaint?.id || `DPU-${Date.now()}`,
                title: formData.title.trim(),
                description: formData.description.trim(),
                category: formData.category,
                department: user?.department || "Unknown",
                yearOfStudy: user?.yearOfStudy || "Unknown",
                studentId: user!.id,
                studentName: user!.name,
                studentUsername: user!.username,
                createdAt: complaint?.createdAt || nowISO,
                status: complaint?.status ?? 'submitted',
                history: complaint?.history ?? [{ status: 'submitted', date: nowISO }],
                attachment: complaint?.attachment || '', // Existing URL (for edits)
                attachmentFile: uploadedFile || undefined, // New file to upload
            };

            onSubmit(complaintData);

            addNotification?.({
                type: 'success',
                message: complaint ? 'Complaint updated successfully!' : 'Complaint submitted successfully!'
            });
            if (!complaint) {
                setFormData({
                    title: '',
                    description: '',
                    category: '',
                    attachment: '',
                    department: '',
                    yearOfStudy: ''
                });

                setUploadedFile(null);
            }
        } catch {
            addNotification?.({ type: 'error', message: 'Failed to save complaint. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="shadow-card rounded-md font-body">
            <CardHeader>
                <CardTitle>{complaint ? 'Edit Complaint' : 'Submit New Complaint'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Complaint Title *</Label>
                        <Input
                            id="title"
                            type="text"
                            className="text-sm"
                            value={formData.title}
                            onChange={e => handleInputChange('title', e.target.value)}
                            maxLength={100}
                            placeholder="Brief description of the issue"
                            required
                        />
                        <p className="text-sm text-pink-500">{formData.title.length}/100 characters</p>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                            value={formData.category}
                            onValueChange={value => handleInputChange('category', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat.name} value={cat.name}>
                                        <div className="flex items-center gap-2">
                                            <cat.icon className="w-4 h-4" />
                                            {cat.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            className="text-sm"
                            onChange={e => handleInputChange('description', e.target.value)}
                            placeholder="Please provide detailed information about your complaint. Include relevant dates, locations, and any other important details."
                            required
                            rows={6}
                            maxLength={1000}
                        />
                        <p className="text-sm text-pink-500">{formData.description.length}/1000 characters</p>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="attachment">Attachment (optional)</Label>
                        <FileUpload id="attachment" onChange={handleFileChange} />

                        {uploadedFile && (
                            <p className="text-sm text-gray-500 truncate">
                                File uploaded: <span className="font-medium">{uploadedFile.name}</span> ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                        <h4 className="font-medium text-yellow-800 mb-2">Important Guidelines:</h4>
                        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                            <li>Be specific about course codes, lab numbers, or faculty names when relevant</li>
                            <li>For technical issues, mention software/hardware details</li>
                            <li>Include semester and academic year if applicable</li>
                            <li>Avoid using offensive language or personal attacks</li>
                            <li>Your complaint will be reviewed by DPU department authorities within 3-5 business days</li>
                            <li>Uploaded documents will be kept confidential</li>
                        </ul>
                    </div>
                    <div className="flex gap-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : complaint ? 'Update Complaint' : 'Submit Complaint'}
                        </Button>
                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel}>
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default ComplaintForm;
