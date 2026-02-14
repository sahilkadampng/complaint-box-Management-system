import React, { useEffect, useMemo, useState } from 'react';
import StudentSidebar from '@/components/StudentSidebar';
import FacultyLayout from '@/components/FacultyLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
const COLORS = ['#3366cc', '#ff9900', '#109618', '#dc3912'];

const StudentAnalyticsPage: React.FC = () => {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState<any[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const res = await apiClient.getComplaints({ limit: 50 });
                if (!res.error && res.data) {
                    setComplaints(res.data.complaints || []);
                } else {
                    setComplaints([]);
                }
            } catch (err) {
                console.error('Failed to load student complaints for analytics:', err);
                setComplaints([]);
            }
        })();
    }, [user]);

    const stats = useMemo(() => {
        const total = complaints.length;
        const submitted = complaints.filter(c => c.status === 'submitted').length;
        const in_review = complaints.filter(c => c.status === 'in_review').length;
        const need_clarification = complaints.filter(c => c.status === 'need_clarification').length;
        const assigned = complaints.filter(c => c.status === 'assigned').length;
        const resolved = complaints.filter(c => c.status === 'resolved').length;
        const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
        return { total, submitted, in_review, need_clarification, assigned, resolved, pct };
    }, [complaints]);

    const statusData = useMemo(() => {
        return [
            { name: 'Submitted', value: stats.submitted },
            { name: 'In Review', value: stats.in_review },
            { name: 'Need Clarification', value: stats.need_clarification },
            { name: 'Assigned', value: stats.assigned },
            { name: 'Resolved', value: stats.resolved },
        ];
    }, [stats]);

    const handlePieClick = (name: string) => {
        setSelectedStatus(prev => (prev === name ? null : name));
    };

    const filteredComplaints = useMemo(() => {
        if (!selectedStatus) return complaints;
        // map label to internal status keys
        const map: Record<string, string> = {
            'Submitted': 'submitted',
            'In Review': 'in_review',
            'Assigned': 'assigned',
            'Resolved': 'resolved'
        };
        const key = map[selectedStatus] || selectedStatus;
        return complaints.filter(c => c.status === key);
    }, [complaints, selectedStatus]);

    const trendData = useMemo(() => {
        const map: Record<string, number> = {};
        complaints.forEach(c => {
            const d = new Date(c.createdAt);
            if (isNaN(d.getTime())) return;
            const key = d.toLocaleDateString();
            map[key] = (map[key] || 0) + 1;
        });
        return Object.entries(map).map(([date, count]) => ({ date, count }));
    }, [complaints]);

    // Helper: mask student names for privacy (show last 2 chars)
    const maskName = (name?: string) => {
        if (!name) return 'Unknown';
        const visible = name.slice(-2);
        const hidden = '*'.repeat(Math.max(0, name.length - 2));
        return hidden + visible;
    };

    if (!user) return <div>Please log in to view your analytics.</div>;

    return (
        <FacultyLayout>
            <div className="font-body flex w-full bg-gray-50 rounded-md">
                <StudentSidebar />
                <div className="ml-[0rem] mr-[0rem] mt-10 flex-1 h-screen overflow-y-auto bg-background p-4">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between p-1 md:p-6">
                        <div>
                            <h1 className="text-2xl font-bold text-black mb-3 mt-10">Your Complaints Analytics</h1>
                            <p className="text-black text-sm md:text-base">Overview of your complaints and status trends.</p>
                        </div>
                    </div>
                    <hr className="my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <Card>
                            <CardContent>
                                <h3 className="text-sm mt-4">Total complaints</h3>
                                <p className="text-3xl font-bold mt-2">{stats.total}</p>
                                <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-2 bg-primary" style={{ width: `${stats.total ? 100 : 0}%` }} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <h3 className="text-sm mt-4">Resolved</h3>
                                <p className="text-3xl font-bold mt-2">{stats.resolved}</p>
                                <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-2 bg-green-500" style={{ width: `${stats.pct(stats.resolved)}%` }} />
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">{stats.pct(stats.resolved)}% resolved</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <h3 className="text-sm mt-4">Pending</h3>
                                <p className="text-3xl font-bold mt-2">{stats.submitted + stats.in_review + stats.assigned}</p>
                                <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-2 bg-yellow-400" style={{ width: `${stats.pct(stats.submitted + stats.in_review + stats.assigned)}%` }} />
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">{stats.pct(stats.submitted + stats.in_review + stats.assigned)}% pending</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <Card className="p-4">
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle>Status Distribution</CardTitle>
                                {selectedStatus && (
                                    <button className="text-sm text-primary underline" onClick={() => setSelectedStatus(null)}>
                                        Clear filter
                                    </button>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div style={{ height: 220 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={80}>
                                                {statusData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                        onClick={() => handlePieClick(entry.name)}
                                                        cursor="pointer"
                                                        opacity={selectedStatus && selectedStatus !== entry.name ? 0.4 : 1}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-3 flex gap-2 flex-wrap">
                                    {statusData.map((s) => (
                                        <div key={s.name} className={`px-3 py-1 rounded-full text-sm cursor-pointer border ${selectedStatus === s.name ? 'bg-primary text-white' : 'bg-white'}`} onClick={() => handlePieClick(s.name)}>
                                            {s.name}: {s.value} ({stats.pct(s.value)}%)
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="p-4">
                            <CardHeader>
                                <CardTitle>Submission Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div style={{ height: 220 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={trendData}>
                                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="count" fill="#3366cc" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Complaints */}
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
                                            {filteredComplaints.slice().sort((a: any, b: any) => new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime()).slice(0, 1000).map((c: any) => {
                                                const cid = ((c as any)?._id) ?? (c as any).id ?? '-';
                                                return (
                                                    <tr key={cid} className="border-t">
                                                        <td className="px-4 py-3">{cid}</td>
                                                        <td className="px-4 py-3">{c.title}</td>
                                                        <td className="px-4 py-3">{maskName(c.studentName ?? c.studentId)}</td>
                                                        <td className="px-4 py-3">{c.category}</td>
                                                        <td className="px-4 py-3">{c.status}</td>
                                                        <td className="px-4 py-3">{new Date(c.createdAt).toLocaleString()}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </FacultyLayout>
    );
};

export default StudentAnalyticsPage;