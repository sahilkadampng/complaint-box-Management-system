import { useEffect, useState } from "react";

import Sidebar from "@/components/Sidebar";
import Breadcrumb from "@/components/Breadcrumb";
import FacultyLayout from "@/components/FacultyLayout";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

// import {
//     Select,
//     SelectTrigger,
//     SelectValue,
//     SelectContent,
//     SelectItem,
// } from "@/components/ui/select";

// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";

// import {
//     // Download,
//     FileText,
//     Filter,
//     AlertCircle,
//     BarChart3,
// } from "lucide-react";

import type { Complaint } from "@/components/ComplaintForm";

export default function ReportsPage() {


    // Load Complaints (SAME AS FACULTY DASHBOARD)
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [filtered, setFiltered] = useState<Complaint[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("complaints");
        if (saved) {
            const data = JSON.parse(saved);
            setComplaints(data);
            setFiltered(data);
        }
    }, []);


    // Statistics
    const stats = {
        total: complaints.length,
        resolved: complaints.filter(c => c.status === "resolved").length,
        pending: complaints.filter(c =>
            ["submitted", "in_review", "assigned"].includes(c.status)
        ).length,
        escalated: complaints.filter(c => c.status === "escalated").length,
    };


    // Helper: Mask Student Name
    const maskName = (name: string): string => {
        if (!name) return "Unknown";

        // show last 2 characters only
        const visible = name.slice(-2);
        const hidden = "*".repeat(name.length - 2);

        return hidden + visible;
    };

    return (
        <FacultyLayout>
            <div className="font-vend flex w-full bg-gray-50">

                {/* SIDEBAR */}
                <Sidebar />

                {/* MAIN AREA */}
                <div className="ml-[0rem] mr-[0rem] mt-10 flex-1 h-screen overflow-y-auto bg-background p-2">

                    {/* NAVBAR TITLE */}
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between p-2 md:p-6">
                        <div>
                            <h1 className="text-2xl font-bold mb-1 text-black mb-3 mt-10">Reports</h1>
                            <p className="text-black text-sm md:text-base">Manage your account and preferences</p>
                        </div>

                        {/* <div className="flex flex-wrap gap-2 md:gap-4 mt-10 mr-4">
                            <Input placeholder="Search complaints, student or category..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-80 bg-white-100" />
                            <Button variant="secondary" onClick={exportPDF}><Download className="h-4 w-4 mr-0" /> Export Summary</Button>
                        </div> */}
                    </div>

                    <main className="max-w-7xl mx-auto px-2 py-2">
                        <hr className="my-4" />
                        <Breadcrumb current="Reports" />

                        {/* -------------------------------
                        SUMMARY CARDS (LIVE)
                    -------------------------------- */}
                        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

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
                                        <p className="text-2xl font-bold">{stats.resolved}</p>
                                    </div>
                                    <BarChart3 className="h-6 w-6 text-gray-400" />
                                </CardContent>
                            </Card>

                            <Card className="shadow-card rounded-md">
                                <CardContent className="p-5 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Pending</p>
                                        <p className="text-2xl font-bold">{stats.pending}</p>
                                    </div>
                                    <AlertCircle className="h-6 w-6 text-gray-400" />
                                </CardContent>
                            </Card>

                            <Card className="shadow-card rounded-md">
                                <CardContent className="p-5 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Escalated</p>
                                        <p className="text-2xl font-bold">{stats.escalated}</p>
                                    </div>
                                    <Filter className="h-6 w-6 text-gray-400" />
                                </CardContent>
                            </Card>
                        </div> */}

                        {/* -------------------------------
                        TABLE (LATEST 10)
                    -------------------------------- */}
                        <div className="mt-8">
                            <Card className="shadow-card rounded-md">
                                <CardHeader>
                                    <CardTitle>Recent Complaints - latest 10</CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <div className="overflow-x-auto rounded-md border">
                                        <table className="w-full text-sm border-collapse">
                                            <thead className="bg-gray-100 text-gray-700">
                                                <tr className="text-left">
                                                    <th className="px-4 py-3 text-left font-semibold">ID</th>
                                                    <th className="px-4 py-3 text-left font-semibold">Title</th>
                                                    <th className="px-4 py-3 text-left font-semibold">Student</th>
                                                    <th className="px-4 py-3 text-left font-semibold">Category</th>
                                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                                    <th className="px-4 py-3 text-left font-semibold">Created</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {filtered
                                                    .slice()
                                                    .sort((a, b) =>
                                                        new Date(b.createdAt).getTime() -
                                                        new Date(a.createdAt).getTime()
                                                    )
                                                    .slice(0, 10)
                                                    .map((c) => (
                                                        <tr key={c.id} className="border-t">
                                                            <td className="px-4 py-3">{c.id}</td>
                                                            <td className="px-4 py-3">{c.title}</td>
                                                            <td className="px-4 py-3">{maskName(c.studentName ?? c.studentId)}</td>
                                                            <td className="px-4 py-3">{c.category}</td>
                                                            <td className="px-4 py-3">{c.status}</td>
                                                            <td className="px-4 py-3">{new Date(c.createdAt).toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                    </main>
                </div>
            </div>
        </FacultyLayout>
    );
}
