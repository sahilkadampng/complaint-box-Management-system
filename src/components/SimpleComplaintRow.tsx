import { useNavigate } from "react-router-dom";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { generateComplaintPDF } from "@/utils/pdfGenerator";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

import type { Complaint, ComplaintStatus } from "./ComplaintForm";

interface Props {
    complaint: Complaint;
    onStatusChange?: (id: string, status: ComplaintStatus) => void;
}

export default function SimpleComplaintRow({ complaint, onStatusChange }: Props) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addNotification } = useNotification();

    const handlePDF = (e: any) => {
        e.stopPropagation();
        generateComplaintPDF({
            id: complaint.id,
            title: complaint.title,
            description: complaint.description,
            studentName: complaint.studentName,
            studentUsername: complaint.studentUsername,
            category: complaint.category,
            createdAt: complaint.createdAt,
            status: complaint.status,
        });
        addNotification?.({ type: "success", message: "PDF Downloaded!" });
    };

    const handleStatusUpdate = (value: ComplaintStatus, e: any) => {
        e.stopPropagation();
        onStatusChange?.(complaint.id, value);
    };

    const maskName = (name: string): string => {
        if (!name) return "Unknown";

        // show last 2 characters only
        const visible = name.slice(-2);
        const hidden = "*".repeat(name.length - 2);

        return hidden + visible;
    };

    return (
        <div
            onClick={() => navigate(`/complaint/${complaint.id}`)}
            className="
                border-b cursor-pointer transition
                hover:bg-gray-100 
                px-4 py-3
                grid grid-cols-1 md:grid-cols-6 gap-4
            "
        >
            {/* ID */}
            <span className="font-medium md:font-normal text-sm md:text-base" title={complaint.id}>
                {complaint.id ? `${complaint.id.slice(0, 12)}...` : '—'}
            </span>

            {/* TITLE */}
            <span
                className="text-sm md:text-base font-medium truncate block max-w-[140px] md:max-w-[px]"
                title={complaint.title}>
                {complaint.title}
            </span>

            {/* STUDENT (masked) */}
            <span className="text-sm md:text-base">
                {maskName(complaint.studentName)}
            </span>

            {/* CATEGORY */}
            <span className="text-sm md:text-base capitalize">
                {complaint.category}
            </span>

            {/* STATUS (Drop-down on faculty) */}
            <div className="md:block" onClick={(e) => e.stopPropagation()}>
                {user?.role === "faculty" ? (
                    <Select
                        defaultValue={complaint.status}
                        onValueChange={(value) => handleStatusUpdate(value as ComplaintStatus, event)}
                    >
                        <SelectTrigger className="h-8 w-full">
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
                ) : (
                    <span className="capitalize text-sm md:text-base">{complaint.status}</span>
                )}
            </div>

            {/* DATE + PDF */}
            <div className="flex items-center justify-between w-full md:block">
                {/* <span className="text-xs md:text-sm">
                    {new Date(complaint.createdAt).toLocaleString()}
                </span> */}

                {user?.role === "faculty" && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 ml-[25px]"
                        onClick={handlePDF}
                    >
                        <Download className="h-3 w-3" />
                    </Button>
                )}
            </div>
        </div>
    );
}
