/**
 * Complaints Tab - Complaint listing and management
 */

import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, MessageSquare, Search, Eye } from 'lucide-react';
import type { Complaint } from '../dashboard.types';

interface ComplaintsTabProps {
    complaints: Complaint[];
    searchQuery: string;
    statusFilter: string;
    onSearchChange: (query: string) => void;
    onStatusFilterChange: (status: string) => void;
    onExport: () => void;
    getStatusColor: (status: string) => string;
}

export const ComplaintsTab = memo(function ComplaintsTab({
    complaints,
    searchQuery,
    statusFilter,
    onSearchChange,
    onStatusFilterChange,
    onExport,
    getStatusColor,
}: ComplaintsTabProps) {
    const navigate = useNavigate();
    const displayedComplaints = complaints.slice(0, 50);

    return (
        <TabsContent value="complaints" className="space-y-6">
            <Card className="shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-3 text-white">
                                <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg">
                                    <MessageSquare className="h-5 w-5 text-blue-400" />
                                </div>
                                Complaint Management
                            </CardTitle>
                            <CardDescription className="text-slate-400 mt-1">
                                Monitor and manage all system complaints with advanced filtering
                            </CardDescription>
                        </div>
                        <Button
                            onClick={onExport}
                            className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transition-all"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mt-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by title, student, or category..."
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                            <SelectTrigger className="w-full md:w-48 bg-slate-700/50 border-slate-600 text-white">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="submitted">Submitted</SelectItem>
                                <SelectItem value="in_review">In Review</SelectItem>
                                <SelectItem value="assigned">Assigned</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="escalated">Escalated</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="rounded-lg border border-slate-700 overflow-hidden bg-slate-700/20">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-800/50 hover:bg-slate-800/70 border-slate-700">
                                    <TableHead className="text-slate-300 font-bold">Title</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Category</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Status</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Student</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Created</TableHead>
                                    <TableHead className="text-slate-300 font-bold text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayedComplaints.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                                            No complaints found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    displayedComplaints.map((complaint) => (
                                        <TableRow
                                            key={complaint._id}
                                            className="border-slate-700 hover:bg-slate-700/30 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/complaints/${complaint._id}`)}
                                        >
                                            <TableCell className="font-medium text-white max-w-xs truncate">
                                                {complaint.title}
                                            </TableCell>
                                            <TableCell className="text-slate-300">{complaint.category}</TableCell>
                                            <TableCell>
                                                <Badge className={`${getStatusColor(complaint.status)} font-semibold border`}>
                                                    {complaint.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-300">{complaint.studentName}</TableCell>
                                            <TableCell className="text-slate-400 text-sm">
                                                {new Date(complaint.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-slate-400">
                            Showing {displayedComplaints.length} of {complaints.length} complaints
                        </p>
                        {complaints.length > 50 && (
                            <p className="text-xs text-slate-500">Displaying first 50 results</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    );
});
