/**
 * Dashboard Tabs Component
 * Tab navigation for different dashboard sections
 */

import type { ReactNode } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, MessageSquare, Users, TrendingUp, Settings } from 'lucide-react';
import type { DashboardTab } from '../dashboard.types';

interface DashboardTabsProps {
    activeTab: DashboardTab;
    onTabChange: (tab: DashboardTab) => void;
    children: ReactNode;
}

export function DashboardTabs({ activeTab, onTabChange, children }: DashboardTabsProps) {
    const tabClass = "gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-600 hover:text-gray-900 transition-colors";
    
    return (
        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as DashboardTab)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200 rounded-lg p-1">
                <TabsTrigger value="overview" className={tabClass}>
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="complaints" className={tabClass}>
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">Complaints</span>
                </TabsTrigger>
                <TabsTrigger value="users" className={tabClass}>
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Users</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className={tabClass}>
                    <TrendingUp className="h-4 w-4" />
                    <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className={tabClass}>
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
            </TabsList>
            {children}
        </Tabs>
    );
}
