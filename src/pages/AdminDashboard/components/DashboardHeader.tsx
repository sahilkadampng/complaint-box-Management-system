/**
 * Dashboard Header Component
 * Sticky header with refresh control and status indicator
 */

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface DashboardHeaderProps {
    refreshing: boolean;
    onRefresh: () => void;
}

export function DashboardHeader({ refreshing, onRefresh }: DashboardHeaderProps) {
    return (
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
                        <p className="text-sm text-gray-600 mt-0.5">
                            System management and oversight
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onRefresh}
                            disabled={refreshing}
                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                            <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
                            <span className="text-sm font-medium">{refreshing ? 'Refreshing' : 'Refresh'}</span>
                        </Button>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-md">
                            <span className="h-1.5 w-1.5 bg-green-500 rounded-full"></span>
                            <span className="text-xs font-medium text-green-700">System Online</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
