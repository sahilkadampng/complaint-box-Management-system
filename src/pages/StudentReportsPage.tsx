import { useEffect, useState } from "react";
import StudentSidebar from "@/components/StudentSidebar";
import Navbar from "@/components/Navbar";
import Breadcrumb from "@/components/Breadcrumb";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, FileText, Filter, AlertCircle, BarChart3, CheckCircle } from "lucide-react";
import { apiClient } from "@/lib/api";
import type { Complaint } from "@/components/ComplaintForm";
import { useNotification } from "@/context/NotificationContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function StudentReportsPage() {
    const { addNotification } = useNotification();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [filtered, setFiltered] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterCategory, setFilterCategory] = useState<string>("all");

    // Normalize API complaint to frontend format
    const normalizeComplaint = (apiComplaint: any): Complaint => {
        const created = apiComplaint.createdAt || new Date().toISOString();
        const history = Array.isArray(apiComplaint.history) && apiComplaint.history.length > 0
            ? apiComplaint.history.map((h: any) => ({
                status: h.status,
                date: h.date || created,
            }))
            : [{ status: apiComplaint.status || "submitted", date: created }];

        const studentIdObj = apiComplaint.studentId;
        let studentIdVal = "";
        if (studentIdObj && typeof studentIdObj === "object") {
            studentIdVal = studentIdObj._id || studentIdObj.id || "";
        } else if (studentIdObj) {
            studentIdVal = studentIdObj;
        }

        return {
            id: apiComplaint._id || apiComplaint.id || "",
            title: apiComplaint.title || "",
            description: apiComplaint.description || "",
            category: apiComplaint.category || "",
            studentId: studentIdVal,
            studentName: apiComplaint.studentName || (studentIdObj?.name || ""),
            studentUsername: apiComplaint.studentUsername || (studentIdObj?.username || ""),
            createdAt: created,
            status: apiComplaint.status || "submitted",
            history,
            attachment: apiComplaint.attachment || "",
            department: apiComplaint.department || "",
            yearOfStudy: apiComplaint.yearOfStudy || "",
            clarificationMessage: apiComplaint.clarificationMessage || "",
        };
    };

    // Load complaints
    useEffect(() => {
        const loadComplaints = async () => {
            setLoading(true);
            try {
                const response = await apiClient.getComplaints({ limit: 1000 });
                if (response.error) {
                    addNotification?.({ type: "error", message: response.error });
                    setComplaints([]);
                    setFiltered([]);
                } else if (response.data) {
                    const normalized = response.data.complaints.map(normalizeComplaint);
                    setComplaints(normalized);
                    setFiltered(normalized);
                }
            } catch (err) {
                console.error("Failed to load complaints", err);
                addNotification?.({ type: "error", message: "Failed to load complaints" });
                setComplaints([]);
                setFiltered([]);
            } finally {
                setLoading(false);
            }
        };

        loadComplaints();
    }, []);

    // Apply filters
    useEffect(() => {
        let result = complaints;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (c) =>
                    c.title.toLowerCase().includes(term) ||
                    c.description.toLowerCase().includes(term) ||
                    c.id.toLowerCase().includes(term)
            );
        }

        if (filterStatus !== "all") {
            result = result.filter((c) => c.status === filterStatus);
        }

        if (filterCategory !== "all") {
            result = result.filter((c) => c.category === filterCategory);
        }

        setFiltered(result);
    }, [complaints, searchTerm, filterStatus, filterCategory]);

    // Get unique categories
    const categories = Array.from(new Set(complaints.map((c) => c.category).filter(Boolean)));

    // Statistics
    const stats = {
        total: complaints.length,
        resolved: complaints.filter((c) => c.status === "resolved").length,
        pending: complaints.filter((c) =>
            ["submitted", "in_review", "assigned"].includes(c.status)
        ).length,
        escalated: complaints.filter((c) => c.status === "escalated").length,
    };

    // Export to PDF
    const exportPDF = () => {
        if (filtered.length === 0) {
            addNotification?.({ type: "error", message: "No complaints to export" });
            return;
        }

        const doc = new jsPDF();
        const title = "Complaint Reports";
        const date = new Date().toLocaleDateString();

        doc.setFontSize(16);
        doc.text(title, 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated: ${date}`, 14, 25);

        const tableData = filtered.map((c) => [
            c.id.substring(0, 8),
            c.title.substring(0, 30),
            c.category,
            c.status,
            new Date(c.createdAt).toLocaleDateString(),
        ]);

        autoTable(doc, {
            head: [["ID", "Title", "Category", "Status", "Date"]],
            body: tableData,
            startY: 35,
            margin: { top: 20, right: 10, bottom: 10, left: 10 },
        });

        doc.save(`reports-${new Date().toISOString().slice(0, 10)}.pdf`);
        addNotification?.({ type: "success", message: "PDF exported successfully" });
    };

    // Export to CSV
    const exportCSV = () => {
        if (filtered.length === 0) {
            addNotification?.({ type: "error", message: "No complaints to export" });
            return;
        }

        const headers = ["ID", "Title", "Category", "Status", "Created", "Department"];
        const rows = filtered.map((c) => [
            c.id,
            c.title,
            c.category,
            c.status,
            new Date(c.createdAt).toLocaleDateString(),
            c.department || "-",
        ]);

        const csvContent = [headers, ...rows]
            .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `reports-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        addNotification?.({ type: "success", message: "CSV exported successfully" });
    };

    return (
        <div className="font-body">
            <Navbar />
            <div className="flex w-full bg-gray-50">
                {/* SIDEBAR */}
                <StudentSidebar />

                {/* MAIN AREA */}
                <div className="ml-[0rem] mr-[0rem] mt-10 flex-1 h-screen overflow-y-auto bg-background p-2">
                    {/* HEADER */}
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between p-2 md:p-6">
                        <div>
                            <h1 className="text-2xl font-bold text-black mb-3 mt-10">Reports</h1>
                            <p className="text-black text-sm md:text-base">View and analyze your complaint reports</p>
                        </div>
                    </div>

                    <main className="max-w-7xl mx-auto px-2 py-2">
                        <hr className="my-4" />
                        <Breadcrumb current="Reports" />

                        {/* STATS CARDS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <Card className="shadow-card rounded-md">
                                <CardContent className="p-5 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Complaints</p>
                                        <p className="text-2xl font-bold">{stats.total}</p>
                                    </div>
                                    <FileText className="h-6 w-6 text-gray-400" />
                                </CardContent>
                            </Card>

                            <Card className="shadow-card rounded-md">
                                <CardContent className="p-5 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Resolved</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                                    </div>
                                    <CheckCircle className="h-6 w-6 text-green-400" />
                                </CardContent>
                            </Card>

                            <Card className="shadow-card rounded-md">
                                <CardContent className="p-5 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Pending</p>
                                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                    </div>
                                    <BarChart3 className="h-6 w-6 text-yellow-400" />
                                </CardContent>
                            </Card>

                            <Card className="shadow-card rounded-md">
                                <CardContent className="p-5 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Escalated</p>
                                        <p className="text-2xl font-bold text-red-600">{stats.escalated}</p>
                                    </div>
                                    <AlertCircle className="h-6 w-6 text-red-400" />
                                </CardContent>
                            </Card>
                        </div>

                        {/* FILTERS */}
                        <Card className="shadow-card rounded-md mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Filter className="h-5 w-5" /> Filter Reports
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Search</label>
                                    <Input
                                        placeholder="Search by ID, title..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="All Statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="submitted">Submitted</SelectItem>
                                            <SelectItem value="in_review">In Review</SelectItem>
                                            <SelectItem value="assigned">Assigned</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                            <SelectItem value="escalated">Escalated</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Category</label>
                                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* EXPORT BUTTONS */}
                        <div className="flex gap-2 mb-6">
                            <Button variant="secondary" onClick={exportPDF}>
                                <Download className="h-4 w-4 mr-2" /> Export PDF
                            </Button>
                            <Button variant="secondary" onClick={exportCSV}>
                                <Download className="h-4 w-4 mr-2" /> Export CSV
                            </Button>
                        </div>

                        {/* REPORTS TABLE */}
                        <Card className="shadow-card rounded-md">
                            <CardHeader>
                                <CardTitle>Complaint Reports</CardTitle>
                            </CardHeader>

                            <CardContent>
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full text-sm border-collapse">
                                        <thead className="bg-gray-100 text-gray-700">
                                            <tr className="text-left">
                                                <th className="px-4 py-3 text-left font-semibold">ID</th>
                                                <th className="px-4 py-3 text-left font-semibold">Title</th>
                                                <th className="px-4 py-3 text-left font-semibold">Category</th>
                                                <th className="px-4 py-3 text-left font-semibold">Status</th>
                                                <th className="px-4 py-3 text-left font-semibold">Created</th>
                                                <th className="px-4 py-3 text-left font-semibold">Department</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                                                        Loading complaints…
                                                    </td>
                                                </tr>
                                            ) : filtered.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                                                        No complaints found
                                                    </td>
                                                </tr>
                                            ) : (
                                                filtered
                                                    .sort(
                                                        (a, b) =>
                                                            new Date(b.createdAt).getTime() -
                                                            new Date(a.createdAt).getTime()
                                                    )
                                                    .map((complaint) => (
                                                        <tr key={complaint.id} className="border-t hover:bg-gray-50">
                                                            <td className="px-4 py-3 font-mono text-xs">
                                                                {complaint.id.substring(0, 8)}
                                                            </td>
                                                            <td className="px-4 py-3">{complaint.title}</td>
                                                            <td className="px-4 py-3">{complaint.category}</td>
                                                            <td className="px-4 py-3">
                                                                <span
                                                                    className={`px-2 py-1 rounded text-xs font-semibold ${
                                                                        complaint.status === "resolved"
                                                                            ? "bg-green-100 text-green-800"
                                                                            : complaint.status === "escalated"
                                                                            ? "bg-red-100 text-red-800"
                                                                            : complaint.status === "in_review" || complaint.status === "assigned"
                                                                            ? "bg-blue-100 text-blue-800"
                                                                            : "bg-gray-100 text-gray-800"
                                                                    }`}
                                                                >
                                                                    {complaint.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {new Date(complaint.createdAt).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-4 py-3">{complaint.department || "-"}</td>
                                                        </tr>
                                                    ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* SUMMARY */}
                        {filtered.length > 0 && (
                            <div className="mt-6 text-sm text-gray-600">
                                <p>Showing {filtered.length} of {complaints.length} complaints</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
