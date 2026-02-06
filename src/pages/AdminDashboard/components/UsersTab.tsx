/**
 * Users Tab - User management interface
 */

import { memo } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Users as UsersIcon, UserPlus, Search, Trash2 } from 'lucide-react';
import type { User } from '../dashboard.types';

interface UsersTabProps {
    users: User[];
    searchQuery: string;
    roleFilter: string;
    onSearchChange: (query: string) => void;
    onRoleFilterChange: (role: string) => void;
    onAddUser: () => void;
    onDeleteUser: (user: User) => void;
    onExport: () => void;
}

export const UsersTab = memo(function UsersTab({
    users,
    searchQuery,
    roleFilter,
    onSearchChange,
    onRoleFilterChange,
    onAddUser,
    onDeleteUser,
    onExport,
}: UsersTabProps) {
    const displayedUsers = users.slice(0, 50);

    return (
        <TabsContent value="users" className="space-y-6">
            <Card className="shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-3 text-white">
                                <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 rounded-lg">
                                    <UsersIcon className="h-5 w-5 text-indigo-400" />
                                </div>
                                User Management
                            </CardTitle>
                            <CardDescription className="text-slate-400 mt-1">
                                Manage system users, roles, and permissions
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={onAddUser}
                                className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all"
                            >
                                <UserPlus className="h-4 w-4" />
                                Add User
                            </Button>
                            <Button
                                onClick={onExport}
                                variant="outline"
                                className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                            >
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mt-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by name, email, or username..."
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/20"
                                />
                            </div>
                        </div>
                        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
                            <SelectTrigger className="w-full md:w-48 bg-slate-700/50 border-slate-600 text-white">
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="student">Students</SelectItem>
                                <SelectItem value="faculty">Faculty</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="rounded-lg border border-slate-700 overflow-hidden bg-slate-700/20">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-800/50 hover:bg-slate-800/70 border-slate-700">
                                    <TableHead className="text-slate-300 font-bold">Name</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Email</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Username</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Role</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Department</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Joined</TableHead>
                                    <TableHead className="text-slate-300 font-bold text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayedUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                                            No users found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    displayedUsers.map((user) => (
                                        <TableRow
                                            key={user._id}
                                            className="border-slate-700 hover:bg-slate-700/30 transition-colors"
                                        >
                                            <TableCell className="font-medium text-white">{user.name}</TableCell>
                                            <TableCell className="text-slate-300">{user.email}</TableCell>
                                            <TableCell className="text-slate-300">{user.username}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={`${user.role === 'faculty'
                                                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                                        } border font-semibold capitalize`}
                                                >
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-300">{user.department || 'N/A'}</TableCell>
                                            <TableCell className="text-slate-400 text-sm">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteUser(user);
                                                    }}
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
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
                            Showing {displayedUsers.length} of {users.length} users
                        </p>
                        {users.length > 50 && (
                            <p className="text-xs text-slate-500">Displaying first 50 results</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    );
});
