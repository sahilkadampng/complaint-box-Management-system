// AnalyticsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import FacultyLayout from "@/components/FacultyLayout";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, CheckCircle, AlertTriangle, Download } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Legend,
    LineChart,
    Line,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Complaint } from "@/components/ComplaintForm";

/**
 * AnalyticsPage
 * - Designed to match the complaint object used in your FacultyDashboard
 * - Fields used: title, description, category, studentId, studentName, createdAt, status, history, department, yearOfStudy
 */
const COLORS = ["#3366cc", "#ff9900", "#dc3912", "#109618", "#990099", "#6a1b9a", "#00aaff"];

const AnalyticsPage: React.FC = () => {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("complaints") || "[]");
        // normalize some older shapes defensively
        const normalized: Complaint[] = (saved || []).map((c: any) => {
            const createdAt = c.createdAt ?? new Date().toISOString();
            const history = Array.isArray(c.history) && c.history.length ? c.history : [{ status: c.status ?? "submitted", date: createdAt }];
            const status =
                c.status === "pending" ? "in_review" : ["submitted", "in_review", "assigned", "resolved", "escalated"].includes(c.status) ? c.status : "submitted";

            return {
                ...c,
                createdAt,
                history,
                status,
                category: c.category ?? "Uncategorized",
                department: c.department ?? "Unknown",
                yearOfStudy: c.yearOfStudy ?? "Unknown",
                studentName: c.studentName ?? c.studentId ?? "Unknown",
            } as Complaint;
        });

        setComplaints(normalized);
    }, []);

    // ---------------- BASIC STATS ----------------
    const stats = useMemo(() => {
        const total = complaints.length;
        const submitted = complaints.filter((c) => c.status === "submitted").length;
        const in_review = complaints.filter((c) => c.status === "in_review").length;
        const assigned = complaints.filter((c) => c.status === "assigned").length;
        const resolved = complaints.filter((c) => c.status === "resolved").length;
        const escalated = complaints.filter((c) => c.status === "escalated").length;
        const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
        const students = new Set(complaints.map((c) => c.studentId)).size;
        return { total, submitted, in_review, assigned, resolved, escalated, resolutionRate, students };
    }, [complaints]);

    // ---------------- STATUS & CATEGORY DISTRIBUTIONS ----------------
    const statusData = useMemo(() => {
        return [
            { name: "Submitted", value: stats.submitted },
            { name: "In Review", value: stats.in_review },
            { name: "Assigned", value: stats.assigned },
            { name: "Resolved", value: stats.resolved },
            { name: "Escalated", value: stats.escalated },
        ];
    }, [stats]);

    const categoriesData = useMemo(() => {
        const map: Record<string, number> = {};
        complaints.forEach((c) => {
            const k = c.category ?? "Uncategorized";
            map[k] = (map[k] || 0) + 1;
        });
        return Object.entries(map)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [complaints]);

    // ---------------- DEPARTMENT & YEAR ----------------
    const departmentData = useMemo(() => {
        const map: Record<string, number> = {};
        complaints.forEach((c) => {
            const k = c.department ?? "Unknown";
            map[k] = (map[k] || 0) + 1;
        });
        return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [complaints]);

    const yearData = useMemo(() => {
        const map: Record<string, number> = {};
        complaints.forEach((c) => {
            const k = c.yearOfStudy ?? "Unknown";
            map[k] = (map[k] || 0) + 1;
        });
        return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [complaints]);

    // ---------------- TREND (daily) ----------------
    const trendData = useMemo(() => {
        const map: Record<string, number> = {};
        complaints.forEach((c) => {
            // safe parse date
            const d = new Date(c.createdAt);
            if (isNaN(d.getTime())) return;
            const key = d.toLocaleDateString();
            map[key] = (map[key] || 0) + 1;
        });
        return Object.entries(map)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // chronological
    }, [complaints]);

    // ---------------- AVERAGE RESOLUTION TIME ----------------
    const avgResolutionDays = useMemo(() => {
        const resolvedComplaints = complaints.filter((c) => c.status === "resolved");
        const diffs: number[] = [];

        resolvedComplaints.forEach((c) => {
            const created = new Date(c.createdAt).getTime();
            // find resolved date in history
            const resolvedEntry = Array.isArray(c.history) ? c.history.find((h) => h.status === "resolved") : null;
            const resolvedDate = resolvedEntry ? new Date(resolvedEntry.date).getTime() : created;
            if (!isNaN(created) && !isNaN(resolvedDate) && resolvedDate >= created) {
                diffs.push((resolvedDate - created) / (1000 * 60 * 60 * 24)); // days
            }
        });

        if (!diffs.length) return 0;
        const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
        return Math.round(avg * 10) / 10;
    }, [complaints]);

    // ---------------- TOP STUDENTS (by number of complaints) ----------------
    // const topStudents = useMemo(() => {
    //     const map: Record<string, { studentName: string; count: number }> = {};
    //     complaints.forEach((c) => {
    //         const id = c.studentId ?? "Unknown";
    //         const name = c.studentName ?? id;
    //         if (!map[id]) map[id] = { studentName: name, count: 0 };
    //         map[id].count += 1;
    //     });
    //     return Object.entries(map)
    //         .map(([id, v]) => ({ id, name: v.studentName, count: v.count }))
    //         .sort((a, b) => b.count - a.count)
    //         .slice(0, 8);
    // }, [complaints]);

    // ---------------- ESCALATION RATIO ----------------
    const escalationRatio = useMemo(() => {
        if (!complaints.length) return 0;
        return Math.round((complaints.filter((c) => c.status === "escalated").length / complaints.length) * 100);
    }, [complaints]);

    // ---------------- FILTERED COMPLAINTS FOR SEARCH (simple) ----------------
    const filtered = useMemo(() => {
        if (!search.trim()) return complaints;
        const q = search.toLowerCase();
        return complaints.filter((c) => {
            return (
                (c.title ?? "").toLowerCase().includes(q) ||
                (c.description ?? "").toLowerCase().includes(q) ||
                (c.category ?? "").toLowerCase().includes(q) ||
                (c.studentName ?? "").toLowerCase().includes(q) ||
                (c.studentId ?? "").toLowerCase().includes(q)
            );
        });
    }, [complaints, search]);

    const maskName = (name: string): string => {
        if (!name) return "Unknown";

        // show last 2 characters only
        const visible = name.slice(-2);
        const hidden = "*".repeat(name.length - 2);

        return hidden + visible;
    };


    // ---------------- EXPORT PDF ----------------
    const exportPDF = () => {
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const now = new Date();

        doc.setFontSize(16);
        doc.text("DYPDPU - Complaints Analytics", 40, 40);

        doc.setFontSize(10);
        doc.text(`Generated: ${now.toLocaleString()}`, 40, 56);

        // ------------------- SUMMARY TABLE -------------------
        autoTable(doc, {
            startY: 72,
            head: [["Metric", "Value"]],
            body: [
                ["Total complaints", stats.total],
                ["Resolved", stats.resolved],
                ["Pending", stats.submitted + stats.in_review + stats.assigned],
                ["Escalated", stats.escalated],
                ["Resolution rate", `${stats.resolutionRate}%`],
                ["Avg resolution (days)", avgResolutionDays],
                ["Unique students", stats.students],
            ],
            theme: "striped",
            styles: { fontSize: 10 },
        });

        // Get last Y position safely
        const lastY = (doc as any).lastAutoTable.finalY || 180;

        // ------------------- CATEGORIES TABLE -------------------
        const catRows = categoriesData.slice(0, 20).map((c) => [c.name, c.value]);

        autoTable(doc, {
            startY: lastY + 20,
            head: [["Category", "Count"]],
            body: catRows,
            styles: { fontSize: 10 },
        });

        // ---------------- SAVE PDF ----------------
        doc.save(`analytics_${now.toISOString().slice(0, 10)}.pdf`);
    };


    return (
        <FacultyLayout>
            <div className="font-vend flex w-full bg-gray-50 rounded-md">
                <Sidebar />
                <div className="ml-[0rem] mr-[0rem] mt-10 flex-1 h-screen overflow-y-auto bg-background p-4">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between p-1 md:p-6">
                        <div>
                            <h1 className="text-2xl font-bold mb-1 text-black mb-3 mt-10">Analytics Dashboard</h1>
                            <p className="text-black text-sm md:text-base">Overview of complaint activity, trends and KPIs.</p>
                        </div>

                        <div className="flex flex-wrap gap-2 md:gap-4 mt-5 mr-4">
                            <Input placeholder="Search complaints, student or category..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-80 bg-white-100" />
                            <Button variant="secondary" onClick={exportPDF}><Download className="h-4 w-4 mr-0" /> Export Summary</Button>
                        </div>
                    </div>

                    <hr className="my-4" />
                    <Breadcrumb current="Analytics" />

                    {/* Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6">
                        <Card className="shadow-card rounded-md"><CardContent className="p-4 flex justify-between items-center"><div><p className="text-sm font-medium text-muted-foreground">Total Complaints</p><p className="text-2xl font-bold">{stats.total}</p></div><FileText className="h-4 w-4 text-gray-400" /></CardContent></Card>
                        <Card className="shadow-card rounded-md"><CardContent className="p-4 flex justify-between items-center"><div><p className="text-sm font-medium text-muted-foreground">Resolved</p><p className="text-2xl font-bold">{stats.resolved}</p></div><AlertTriangle className="h-4 w-4 text-gray-400" /></CardContent></Card>
                        <Card className="shadow-card rounded-md"><CardContent className="p-4 flex justify-between items-center"><div><p className="text-sm font-medium text-muted-foreground">Pending</p><p className="text-2xl font-bold">{stats.submitted + stats.in_review + stats.assigned}</p></div><AlertTriangle className="h-4 w-4 text-gray-400" /></CardContent></Card>
                        <Card className="shadow-card rounded-md"><CardContent className="p-4 flex justify-between items-center"><div><p className="text-sm font-medium text-muted-foreground">Resolution Rate</p><p className="text-2xl font-bold">{stats.resolutionRate}%</p></div><CheckCircle className="h-4 w-4 text-gray-400" /></CardContent></Card>
                    </div>

                    {/* charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <Card className="h-[420px] rounded-md shadow-card">
                            <CardHeader><CardTitle>Status Distribution</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={110} label>
                                            {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="h-[420px] rounded-md shadow-card">
                            <CardHeader><CardTitle>Complaints by Category</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={categoriesData}>
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" fill={COLORS[0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Trend + Dept + Avg Resolution */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <Card className="h-[360px] rounded-md shadow-card">
                            <CardHeader><CardTitle>Daily Trend</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={trendData}>
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="count" stroke="#ff7300" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                                <div className="mt-4 text-sm text-muted-foreground">Daily complaints (based on createdAt)</div>
                            </CardContent>
                        </Card>

                        <Card className="h-[360px] rounded-md shadow-card">
                            <CardHeader><CardTitle>By Department</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={departmentData}>
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#3366cc" />
                                    </BarChart>
                                </ResponsiveContainer>
                                <div className="mt-3 text-sm text-muted-foreground">Breakdown by department</div>
                            </CardContent>
                        </Card>

                        <Card className="h-[360px] rounded-md shadow-card flex flex-col justify-center items-center p-6">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold">Avg Resolution Time</h3>
                                <p className="text-4xl font-bold mt-3">{avgResolutionDays} days</p>
                                <p className="text-sm text-muted-foreground mt-2">Average for resolved complaints</p>
                                <div className="mt-3 text-sm text-muted-foreground">Escalation ratio: {escalationRatio}%</div>
                            </div>
                        </Card>
                    </div>

                    {/* Top students and year-of-study */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* <Card>
                            <CardHeader><CardTitle>Top Active Students</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-2">
                                    {topStudents.length === 0 ? (
                                        <div className="text-sm text-muted-foreground">No student activity yet</div>
                                    ) : (
                                        topStudents.map((s, idx) => (
                                            <div key={s.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                                <div>
                                                    <div className="font-medium">{s.name}</div>
                                                    <div className="text-xs text-muted-foreground">{s.id}</div>
                                                </div>
                                                <div className="text-sm font-semibold">{s.count}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card> */}

                        <Card className="shadow-card rounded-md">
                            <CardHeader><CardTitle>By Year of Study</CardTitle></CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={yearData}>
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#8d8d8dff" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* quick raw table summary */}
                    <div className="mt-8">
                        <Card className="shadow-card rounded-md p-[-4px]">
                            <CardHeader><CardTitle>All reports</CardTitle></CardHeader>
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
                                            {filtered.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 1000).map((c) => (
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
                </div>
            </div>
        </FacultyLayout >
    );
};

export default AnalyticsPage;
