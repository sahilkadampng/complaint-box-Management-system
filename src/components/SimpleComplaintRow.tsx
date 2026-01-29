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

    const statusOrder: ComplaintStatus[] = ["submitted", "in_review", "need_clarification", "assigned", "resolved", "escalated"];
    const currentIndex = statusOrder.indexOf(complaint.status as ComplaintStatus);

    const handleStatusUpdate = (value: ComplaintStatus) => {
        const nextIndex = statusOrder.indexOf(value);

        // Prevent going backward
        if (nextIndex !== -1 && currentIndex !== -1 && nextIndex < currentIndex) {
            addNotification?.({ type: "warning", message: "You cannot move a complaint back to a previous stage." });
            return;
        }

        // Allow skipping stages only if the skipped stage is "need_clarification"
        if (nextIndex !== -1 && currentIndex !== -1 && nextIndex > currentIndex + 1) {
            // Check if all skipped stages are "need_clarification"
            const skippedStages = statusOrder.slice(currentIndex + 1, nextIndex);
            const hasNonOptionalSkip = skippedStages.some(stage => stage !== "need_clarification");
            
            if (hasNonOptionalSkip) {
                const skippedStatus = statusOrder[currentIndex + 1].replace("_", " ");
                addNotification?.({ type: "error", message: `Cannot skip stages. Please complete "${skippedStatus}" first.` });
                return;
            }
        }

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
            onClick={() => navigate(`/faculty-dashboard/complaint/${complaint.id}`)}
            className="
                border-b cursor-pointer transition
                hover:bg-gray-100 
                px-4 py-3
                grid grid-cols-1 md:grid-cols-6 gap-4 font-body
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
                        value={complaint.status}
                        onValueChange={(value) => handleStatusUpdate(value as ComplaintStatus)}
                    >
                        <SelectTrigger className="h-8 w-full" onPointerDown={(e) => e.stopPropagation()}>
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent onPointerDown={(e) => e.stopPropagation()}>
                            <SelectItem value="submitted" disabled={statusOrder.indexOf("submitted") < currentIndex}><div className="flex justify-between items-start"><div className="h-2 w-2 bg-gray-500 rounded-lg ml-[0px] mt-[5px]"></div><p className="ml-2 mb-0">Submitted</p></div></SelectItem>
                            <SelectItem value="in_review" disabled={statusOrder.indexOf("in_review") < currentIndex}><div className="flex justify-between items-start"><div className="h-2 w-2 bg-amber-500 rounded-lg ml-[0px] mt-[5px]"></div><p className="ml-2 mb-0">In Review</p></div></SelectItem>
                            <SelectItem value="need_clarification" disabled={statusOrder.indexOf("need_clarification") < currentIndex}><div className="flex justify-between items-start"><div className="h-2 w-2 bg-purple-500 rounded-lg ml-[0px] mt-[5px]"></div><p className="ml-4 mb-0">Need Clarification</p></div></SelectItem>
                            <SelectItem value="assigned" disabled={statusOrder.indexOf("assigned") < currentIndex}><div className="flex justify-between items-start"><div className="h-2 w-2 bg-blue-500 rounded-lg ml-[0px] mt-[5px]"></div><p className="ml-2 mb-0">Assigned</p></div></SelectItem>
                            <SelectItem value="resolved" disabled={statusOrder.indexOf("resolved") < currentIndex}><div className="flex justify-between items-start"><div className="h-2 w-2 bg-green-500 rounded-lg ml-[0px] mt-[5px]"></div><p className="ml-2 mb-0">Resolved</p></div></SelectItem>
                            <SelectItem value="escalated" disabled={statusOrder.indexOf("escalated") < currentIndex}><div className="flex justify-between items-start"><div className="h-2 w-2 bg-red-500 rounded-lg ml-[0px] mt-[5px]"></div><p className="ml-2 mb-0">Escalated</p></div></SelectItem>
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
