import { CheckCircle, Clock, Eye, UserCheck, AlertCircle } from "lucide-react";
import type { ComplaintHistory, ComplaintStatus } from '@/components/ComplaintForm';

const statusSteps: { key: ComplaintStatus; label: string; icon: any }[] = [
    { key: "submitted", label: "Submitted", icon: Clock },
    { key: "in_review", label: "In Review", icon: Eye },
        { key: "need_clarification", label: "Need Clarification", icon: AlertCircle },
    { key: "assigned", label: "Assigned", icon: UserCheck },
    { key: "resolved", label: "Resolved", icon: CheckCircle },
    { key: "escalated", label: "Escalated", icon: AlertCircle },
];

interface Props {
    history: ComplaintHistory[];
}

export default function ComplaintTimeline({ history }: Props) {
    return (
        <div className="w-full mt-4 p-4 border rounded-lg bg-white shadow-sm">
            <div className="flex overflow-x-auto no-scrollbar gap-10 min-w-max relative px-2 py-1">
                {statusSteps.map((step, idx) => {
                    const entry = history.find(h => h.status === step.key);
                    const Icon = step.icon;
                    const isDone = !!entry;

                    return (
                        <div
                            key={idx}
                            className="flex flex-col items-center text-center relative flex-shrink-0"
                        >
                            {/* Connector */}
                            {idx !== 0 && (
                                <div
                                    className={`absolute top-3 -left-10 w-10 h-0.5 ${isDone ? "bg-gray-300" : "bg-gray-300"}`}
                                />
                            )}

                            <div
                                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2 ${isDone ? "border-green-500 bg-green-100" : "border-gray-300 bg-gray-100"
                                    }`}
                            >
                                <Icon className={`h-5 w-5 ${isDone ? "text-green-600" : "text-gray-400"}`} />
                            </div>

                            <span className={`text-sm font-medium ${isDone ? "text-black" : "text-gray-400"}`}>
                                {step.label}
                            </span>

                            {entry && (
                                <span className="text-[11px] text-black-500 mt-1">
                                    {new Date(entry.date).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
