import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BreadcrumbProps {
    current: string; // Current page name
}

export default function Breadcrumb({ current }: BreadcrumbProps) {
    const navigate = useNavigate();

    return (
        <div className="text-sm text-gray-500 flex items-center gap-2 mb-6 mt-2">

            {/* Home (Dashboard) */}
            <span
                onClick={() => navigate("/faculty-dashboard")}
                className="cursor-pointer hover:text-primary transition"
            >
                Dashboard
            </span>

            <ChevronRight className="h-4 w-4 text-gray-400" />

            {/* Current Page */}
            <span className="text-black font-medium">{current}</span>
        </div>
    );
}
