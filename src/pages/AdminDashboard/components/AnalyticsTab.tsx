/**
 * Analytics Tab - System analytics and insights
 */

import { memo } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity, BarChart3 } from 'lucide-react';
import type { DashboardStats, CategoryDistribution, StatusDistribution } from '../dashboard.types';

interface AnalyticsTabProps {
    stats: DashboardStats;
    categoryDistribution: CategoryDistribution;
    statusDistribution: StatusDistribution;
}

export const AnalyticsTab = memo(function AnalyticsTab({
    stats,
    categoryDistribution,
    statusDistribution,
}: AnalyticsTabProps) {
    const categoryEntries = Object.entries(categoryDistribution).sort((a, b) => b[1] - a[1]);
    const statusEntries = Object.entries(statusDistribution).sort((a, b) => b[1] - a[1]);

    return (
        <TabsContent value="analytics" className="space-y-6">
            <Card className="shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-600/10 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-green-400" />
                        </div>
                        System Analytics
                    </CardTitle>
                    <CardDescription className="text-slate-400 mt-1">
                        Comprehensive overview of system performance and metrics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Key Metrics */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-400" />
                                Key Performance Indicators
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-700">
                                    <p className="text-slate-400 text-sm">Resolution Rate</p>
                                    <p className="text-3xl font-bold text-green-300 mt-2">{stats.resolutionRate}%</p>
                                    <Badge className="mt-2 bg-green-500/20 text-green-300 border border-green-500/30">
                                        Excellent
                                    </Badge>
                                </div>
                                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-700">
                                    <p className="text-slate-400 text-sm">Avg Response Time</p>
                                    <p className="text-3xl font-bold text-blue-300 mt-2">{stats.avgResponseTime} days</p>
                                    <Badge className="mt-2 bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                        Good
                                    </Badge>
                                </div>
                                <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-700">
                                    <p className="text-slate-400 text-sm">Active Users</p>
                                    <p className="text-3xl font-bold text-purple-300 mt-2">{stats.activeUsers}</p>
                                    <Badge className="mt-2 bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                        {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of total
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Complaints by Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg border border-purple-700/50 shadow-xl">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-purple-400" />
                                    Complaints by Category
                                </h3>
                                <div className="space-y-3">
                                    {categoryEntries.length === 0 ? (
                                        <p className="text-slate-400 text-sm">No data available</p>
                                    ) : (
                                        categoryEntries.map(([category, count]) => (
                                            <div key={category} className="flex items-center justify-between">
                                                <span className="text-slate-300 capitalize">{category}</span>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 bg-slate-700 rounded-full w-32 overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                                                            style={{
                                                                width: `${(count / stats.totalComplaints) * 100}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-white font-semibold text-sm w-8 text-right">{count}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="p-6 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-lg border border-cyan-700/50 shadow-xl">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-cyan-400" />
                                    Status Distribution
                                </h3>
                                <div className="space-y-3">
                                    {statusEntries.length === 0 ? (
                                        <p className="text-slate-400 text-sm">No data available</p>
                                    ) : (
                                        statusEntries.map(([status, count]) => (
                                            <div key={status} className="flex items-center justify-between">
                                                <span className="text-slate-300 capitalize">{status.replace('_', ' ')}</span>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 bg-slate-700 rounded-full w-32 overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                                            style={{
                                                                width: `${(count / stats.totalComplaints) * 100}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-white font-semibold text-sm w-8 text-right">{count}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* User Growth */}
                        <div className="p-6 bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-lg border border-orange-700/50 shadow-xl">
                            <h3 className="text-lg font-bold text-white mb-4">User Growth Metrics</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-slate-400 text-xs">Total Users</p>
                                    <p className="text-2xl font-bold text-white mt-1">{stats.totalUsers}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs">Faculty</p>
                                    <p className="text-2xl font-bold text-white mt-1">{stats.totalFaculty}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs">Students</p>
                                    <p className="text-2xl font-bold text-white mt-1">
                                        {stats.totalUsers - stats.totalFaculty}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs">New (30d)</p>
                                    <p className="text-2xl font-bold text-white mt-1">{stats.recentlyJoined}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    );
});
