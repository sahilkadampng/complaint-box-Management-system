import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export type ComplaintStatus =
    "submitted" | "in_review" | "assigned" | "resolved" | "escalated";

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
        attachment: complaint?.attachment || ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const categories = ['Exam', 'Hostel', 'Academics', 'Others'];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setFormData(prev => ({ ...prev, attachment: reader.result as string }));
            };
            reader.readAsDataURL(file);
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
                studentId: user!.id,
                studentName: user!.name,
                studentUsername: user!.username,
                createdAt: complaint?.createdAt || nowISO,
                // If editing keep existing status/history, else initialize timeline
                status: complaint?.status ?? 'submitted',
                history: complaint?.history ?? [{ status: 'submitted', date: nowISO }],
                attachment: formData.attachment
            };

            onSubmit(complaintData);

            addNotification?.({
                type: 'success',
                message: complaint ? 'Complaint updated successfully!' : 'Complaint submitted successfully!'
            });

            if (!complaint) {
                setFormData({ title: '', description: '', category: '', attachment: '' });
            }
        } catch {
            addNotification?.({ type: 'error', message: 'Failed to save complaint. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Card className="shadow-card rounded-md">
            <CardHeader>
                <CardTitle>{complaint ? 'Edit Complaint' : 'Submit New Complaint'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Complaint Title *</Label>
                        <Input
                            id="title"
                            type="text"
                            value={formData.title}
                            onChange={e => handleInputChange('title', e.target.value)}
                            required
                        />
                    </div>

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
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={e => handleInputChange('description', e.target.value)}
                            required
                            rows={6}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="attachment">Attachment (optional)</Label>
                        <Input
                            type="file"
                            id="attachment"
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                        />
                        {formData.attachment && (
                            <p className="text-sm text-muted-foreground truncate">
                                {formData.attachment.substring(0, 30)}...
                            </p>
                        )}
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
