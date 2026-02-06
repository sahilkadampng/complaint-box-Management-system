/**
 * Overview Tab - Professional Enterprise Design
 * Clean, data-first dashboard with minimal decoration
 */

import { memo } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  TrendingUp,
  UserPlus,
  Download,
  BarChart3,
} from 'lucide-react';
import type { DashboardStats } from '../dashboard.types';

interface OverviewTabProps {
  stats: DashboardStats;
  onAddUser: () => void;
  onExportComplaints: () => void;
  onViewAnalytics: () => void;
}

export const OverviewTab = memo(function OverviewTab({
  stats,
  onAddUser,
  onExportComplaints,
  onViewAnalytics,
}: OverviewTabProps) {
  return (
    <TabsContent value="overview" className="space-y-6">
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Complaints"
          value={stats.totalComplaints}
          icon={FileText}
          color="blue"
        />
        <MetricCard
          label="Active Cases"
          value={stats.pendingComplaints}
          icon={Clock}
          color="amber"
        />
        <MetricCard
          label="Resolved"
          value={stats.resolvedComplaints}
          subtitle={`${stats.resolutionRate}% resolution rate`}
          icon={CheckCircle2}
          color="green"
        />
        <MetricCard
          label="Escalated"
          value={stats.escalatedComplaints}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* User Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Total Users"
          value={stats.totalUsers}
          subtitle="Registered accounts"
          icon={Users}
          color="purple"
        />
        <MetricCard
          label="Faculty Staff"
          value={stats.totalFaculty}
          subtitle={`${stats.totalUsers - stats.totalFaculty} students`}
          icon={Users}
          color="indigo"
        />
        <MetricCard
          label="Recently Joined"
          value={stats.recentlyJoined}
          subtitle="Last 30 days"
          icon={TrendingUp}
          color="cyan"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={onAddUser}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserPlus className="h-4 w-4" />
              <span className="font-medium">Add User</span>
            </Button>
            <Button
              onClick={onExportComplaints}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="font-medium">Export Complaints</span>
            </Button>
            <Button
              onClick={onViewAnalytics}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="font-medium">View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
});

// Reusable Metric Card Component
interface MetricCardProps {
  label: string;
  value: number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'amber' | 'green' | 'red' | 'purple' | 'indigo' | 'cyan';
}

function MetricCard({ label, value, subtitle, icon: Icon, color }: MetricCardProps) {
  const iconColors = {
    blue: 'text-blue-600 bg-blue-50',
    amber: 'text-amber-600 bg-amber-50',
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    purple: 'text-purple-600 bg-purple-50',
    indigo: 'text-indigo-600 bg-indigo-50',
    cyan: 'text-cyan-600 bg-cyan-50',
  };

  return (
    <Card className="hover:border-gray-300 transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</p>
            <p className="text-3xl font-semibold text-gray-900 mt-2">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-2.5 rounded-lg ${iconColors[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
