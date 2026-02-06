/**
 * Settings Tab - System configuration and admin actions
 */

import { memo } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings as SettingsIcon, Zap, Activity, FileText, Database, Trash2, FileCheck } from 'lucide-react';

interface SettingsTabProps {
    onClearCache: () => void;
    onDatabaseBackup: () => void;
    onExportAuditLogs: () => void;
    onGenerateReport: () => void;
}

export const SettingsTab = memo(function SettingsTab({
    onClearCache,
    onDatabaseBackup,
    onExportAuditLogs,
    onGenerateReport,
}: SettingsTabProps) {
    return (
        <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Configuration */}
                <Card className="shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-white">
                            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg">
                                <SettingsIcon className="h-5 w-5 text-blue-400" />
                            </div>
                            System Configuration
                        </CardTitle>
                        <CardDescription className="text-slate-400 mt-1">
                            Manage system-wide settings and preferences
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-700">
                                <div>
                                    <p className="text-white font-semibold">Email Notifications</p>
                                    <p className="text-slate-400 text-xs">Send email updates to users</p>
                                </div>
                                <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">
                                    Enabled
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-700">
                                <div>
                                    <p className="text-white font-semibold">Auto-Assignment</p>
                                    <p className="text-slate-400 text-xs">Automatically assign new complaints</p>
                                </div>
                                <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    Active
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-700">
                                <div>
                                    <p className="text-white font-semibold">Maintenance Mode</p>
                                    <p className="text-slate-400 text-xs">Restrict system access</p>
                                </div>
                                <Badge className="bg-slate-500/20 text-slate-300 border border-slate-500/30">
                                    Disabled
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-700">
                                <div>
                                    <p className="text-white font-semibold">Data Retention</p>
                                    <p className="text-slate-400 text-xs">Keep records for compliance</p>
                                </div>
                                <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    365 days
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* System Status */}
                <Card className="shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-white">
                            <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg">
                                <Activity className="h-5 w-5 text-green-400" />
                            </div>
                            System Status
                        </CardTitle>
                        <CardDescription className="text-slate-400 mt-1">
                            Real-time system performance metrics
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-700">
                                <div>
                                    <p className="text-white font-semibold">API Status</p>
                                    <p className="text-slate-400 text-xs">Backend services</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-green-300 text-sm font-semibold">Online</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-700">
                                <div>
                                    <p className="text-white font-semibold">Database</p>
                                    <p className="text-slate-400 text-xs">MongoDB connection</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-green-300 text-sm font-semibold">Connected</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-700">
                                <div>
                                    <p className="text-white font-semibold">Email Service</p>
                                    <p className="text-slate-400 text-xs">Mail delivery status</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-green-300 text-sm font-semibold">Operational</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-700">
                                <div>
                                    <p className="text-white font-semibold">Storage</p>
                                    <p className="text-slate-400 text-xs">File system capacity</p>
                                </div>
                                <span className="text-white text-sm font-semibold">72% Used</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Admin Actions */}
            <Card className="shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-lg">
                            <Zap className="h-5 w-5 text-yellow-400" />
                        </div>
                        Administrative Actions
                    </CardTitle>
                    <CardDescription className="text-slate-400 mt-1">
                        System maintenance and bulk operations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                            className="h-auto py-3 justify-start bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all text-white"
                            onClick={onClearCache}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear System Cache
                        </Button>
                        <Button
                            className="h-auto py-3 justify-start bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all text-white"
                            onClick={onDatabaseBackup}
                        >
                            <Database className="h-4 w-4 mr-2" />
                            Database Backup
                        </Button>
                        <Button
                            className="h-auto py-3 justify-start bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all text-white"
                            onClick={onExportAuditLogs}
                        >
                            <FileCheck className="h-4 w-4 mr-2" />
                            Export Audit Logs
                        </Button>
                        <Button
                            className="h-auto py-3 justify-start bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-lg hover:shadow-xl transition-all text-white"
                            onClick={onGenerateReport}
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Generate System Report
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* System Information */}
            <Card className="shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-lg">
                            <FileText className="h-5 w-5 text-cyan-400" />
                        </div>
                        System Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                            <p className="text-slate-400 text-xs">Version</p>
                            <p className="text-white font-bold mt-1">v2.1.0</p>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                            <p className="text-slate-400 text-xs">Environment</p>
                            <p className="text-white font-bold mt-1">Production</p>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                            <p className="text-slate-400 text-xs">Uptime</p>
                            <p className="text-white font-bold mt-1">99.9%</p>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                            <p className="text-slate-400 text-xs">Last Updated</p>
                            <p className="text-white font-bold mt-1">Today</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    );
});
