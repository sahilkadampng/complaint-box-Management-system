import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Complaint } from "@/components/ComplaintForm";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
// import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";

export default function ComplaintDetails() {
    const { id } = useParams();
    const [complaint, setComplaint] = useState<Complaint | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const normalizeComplaint = (apiComplaint: any): Complaint => {
        const created = apiComplaint.createdAt || new Date().toISOString();
        const history = Array.isArray(apiComplaint.history) && apiComplaint.history.length > 0
            ? apiComplaint.history.map((h: any) => ({
                status: h.status,
                date: h.date || created,
            }))
            : [{ status: apiComplaint.status || 'submitted', date: created }];

        return {
            id: apiComplaint._id || apiComplaint.id,
            title: apiComplaint.title,
            description: apiComplaint.description,
            category: apiComplaint.category,
            studentId: (typeof apiComplaint.studentId === 'object' && apiComplaint.studentId)
                ? (apiComplaint.studentId._id || apiComplaint.studentId.id)
                : (apiComplaint.studentId || ''),
            studentName: apiComplaint.studentName || (apiComplaint.studentId?.name || ''),
            studentUsername: apiComplaint.studentUsername || (apiComplaint.studentId?.username || ''),
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
        if (!id) return;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.getComplaint(id);
                if (response.error) {
                    setError(response.error);
                    setComplaint(null);
                } else if (response.data && response.data.complaint) {
                    const normalized = normalizeComplaint(response.data.complaint);
                    setComplaint(normalized);
                } else {
                    setComplaint(null);
                }
            } catch (err) {
                console.error('Failed to load complaint', err);
                setError('Failed to load complaint');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-xl font-bold">Loading complaint…</h1>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-xl font-bold">Error</h1>
                <p className="text-sm text-red-600">{error}</p>
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-xl font-bold">Complaint Not Found</h1>
            </div>
        );
    }

    const maskName = (name: string): string => {
        if (!name) return "Unknown";

        // show last 2 characters only
        const visible = name.slice(-2);
        const hidden = "*".repeat(name.length - 2);

        return hidden + visible;
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6 font-body rounded-md mt-[5rem]">
            <Button className="bg-gray-100 hover:bg-gray-200 text-black shadow-sm mb-4 mt-6" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Card className="shadow-sm border rounded-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                        Complaint Details
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">

                    {/* Title + Status */}
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                        <h2 className="text-sm break-words text-pink-500">
                            {complaint.title}
                        </h2>
                        <Badge className="capitalize px-3 py-1 text-sm">
                            {complaint.status}
                        </Badge>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <p className="text-xs text-gray-500">Complaint ID</p>
                            <p className="font-medium break-words">{complaint.id}</p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Student</p>
                            <p className="font-medium">{maskName(complaint.studentName)}</p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Category</p>
                            <p className="font-medium capitalize">{complaint.category}</p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Created At</p>
                            <p className="font-medium">
                                {new Date(complaint.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col space-y-1 w-full rounded-xl">
                        <p className="text-xs text-gray-500">Description</p>

                        <p
                            className="font-medium leading-relaxed whitespace-pre-wrap break-words text-sm p-3 rounded-md bg-gray-50 border max-w-full"
                            style={{ wordBreak: "break-word" }}
                        >
                            {complaint.description}
                        </p>
                    </div>
                    {/* Attachment */}
                    {complaint.attachment && (
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Attachment</p>
                            <a
                                href={complaint.attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                            >
                                View Attachment
                            </a>
                        </div>
                    )}

                    {/* Timeline */}
                    {complaint.history && (
                        <div className="space-y-2 rounded-md">
                            <p className="text-sm font-semibold">Status Timeline</p>
                            <div className="border rounded-md p-4 bg-gray-50 space-y-3">
                                {complaint.history.map((h, i) => (
                                    <div
                                        key={i}
                                        className="text-sm flex items-center justify-between border-b last:border-b-0 py-2"
                                    >
                                        <span className="font-semibold capitalize">{h.status}</span>
                                        <span className="text-gray-600 text-xs">
                                            {new Date(h.date).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
