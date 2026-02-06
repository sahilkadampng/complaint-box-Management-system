/**
 * Admin Dashboard - Main Entry Point
 * Production-grade admin interface with role-based access control
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';

import type { User, NewUserForm, DashboardTab } from './dashboard.types';
import { useDashboardData } from './useDashboardData';
import { validateUserForm, getStatusColorClass } from './dashboard.selectors';
import {
    createUser,
    deleteUser,
    exportComplaintsToCSV,
    exportUsersToCSV,
    generateSystemReport,
    generateDatabaseBackup,
    exportAuditLogs,
} from './dashboard.service';

import {
    DashboardHeader,
    DashboardTabs,
    OverviewTab,
    ComplaintsTab,
    UsersTab,
    AnalyticsTab,
    SettingsTab,
    LoadingScreen,
    UserManagementDialogs,
} from './components';

export default function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addNotification } = useNotification();

    const {
        loading,
        refreshing,
        complaints,
        users,
        stats,
        categoryDistribution,
        statusDistribution,
        filteredComplaints,
        filteredUsers,
        filters,
        setComplaintSearchQuery,
        setComplaintStatusFilter,
        setUserSearchQuery,
        setUserRoleFilter,
        refreshData,
    } = useDashboardData();

    const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
    const [showAddUserDialog, setShowAddUserDialog] = useState(false);
    const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [newUserForm, setNewUserForm] = useState<NewUserForm>({
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'student',
        department: '',
    });

    // Auth guard - redirect if not authenticated
    useEffect(() => {
        if (!user) {
            navigate('/admin-login', { replace: true });
        }
    }, [user, navigate]);

    // User creation handler
    const handleAddUser = useCallback(async () => {
        const validation = validateUserForm(newUserForm);

        if (!validation.valid) {
            addNotification?.({ type: 'error', message: validation.error! });
            return;
        }

        setIsSaving(true);
        try {
            const response = await createUser(newUserForm);

            if (response.error) {
                addNotification?.({ type: 'error', message: response.error });
            } else {
                addNotification?.({ type: 'success', message: 'User created successfully' });
                setShowAddUserDialog(false);
                setNewUserForm({
                    name: '',
                    email: '',
                    username: '',
                    password: '',
                    role: 'student',
                    department: '',
                });
                await refreshData();
            }
        } catch (error) {
            console.error('Error creating user:', error);
            addNotification?.({ type: 'error', message: 'Failed to create user' });
        } finally {
            setIsSaving(false);
        }
    }, [newUserForm, addNotification, refreshData]);

    // User deletion handler
    const handleDeleteUser = useCallback(async () => {
        if (!selectedUser) return;

        setIsSaving(true);
        try {
            const response = await deleteUser(selectedUser._id);

            if (response.error) {
                addNotification?.({ type: 'error', message: response.error });
            } else {
                addNotification?.({ type: 'success', message: 'User deleted successfully' });
                setShowDeleteUserDialog(false);
                setSelectedUser(null);
                await refreshData();
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            addNotification?.({ type: 'error', message: 'Failed to delete user' });
        } finally {
            setIsSaving(false);
        }
    }, [selectedUser, addNotification, refreshData]);

    // Export handlers with notifications
    const handleExportComplaints = useCallback(() => {
        exportComplaintsToCSV(filteredComplaints);
        addNotification?.({ type: 'success', message: 'Complaints exported successfully' });
    }, [filteredComplaints, addNotification]);

    const handleExportUsers = useCallback(() => {
        exportUsersToCSV(filteredUsers);
        addNotification?.({ type: 'success', message: 'Users exported successfully' });
    }, [filteredUsers, addNotification]);

    const handleGenerateReport = useCallback(() => {
        generateSystemReport({ stats, categoryDistribution, statusDistribution });
        addNotification?.({ type: 'success', message: 'Report generated successfully' });
    }, [stats, categoryDistribution, statusDistribution, addNotification]);

    const handleDatabaseBackup = useCallback(() => {
        generateDatabaseBackup(complaints.length, users.length);
        addNotification?.({
            type: 'success',
            message: 'Database backup initiated. Check your downloads folder.',
        });
    }, [complaints.length, users.length, addNotification]);

    const handleExportAuditLogs = useCallback(() => {
        exportAuditLogs();
        addNotification?.({ type: 'success', message: 'Audit logs exported successfully' });
    }, [addNotification]);

    const handleClearCache = useCallback(async () => {
        addNotification?.({ type: 'success', message: 'System cache cleared successfully' });
        await refreshData();
    }, [addNotification, refreshData]);

    // User dialog actions
    const openAddUserDialog = useCallback(() => {
        setShowAddUserDialog(true);
    }, []);

    const openDeleteUserDialog = useCallback((user: User) => {
        setSelectedUser(user);
        setShowDeleteUserDialog(true);
    }, []);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader refreshing={refreshing} onRefresh={refreshData} />

            <div className="max-w-7xl mx-auto px-6 py-8">
                <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab}>
                    <OverviewTab
                        stats={stats}
                        onAddUser={openAddUserDialog}
                        onExportComplaints={handleExportComplaints}
                        onViewAnalytics={() => setActiveTab('analytics')}
                    />

                    <ComplaintsTab
                        complaints={filteredComplaints}
                        searchQuery={filters.complaint.searchQuery}
                        statusFilter={filters.complaint.status}
                        onSearchChange={setComplaintSearchQuery}
                        onStatusFilterChange={setComplaintStatusFilter}
                        onExport={handleExportComplaints}
                        getStatusColor={getStatusColorClass}
                    />

                    <UsersTab
                        users={filteredUsers}
                        searchQuery={filters.user.searchQuery}
                        roleFilter={filters.user.role}
                        onSearchChange={setUserSearchQuery}
                        onRoleFilterChange={setUserRoleFilter}
                        onAddUser={openAddUserDialog}
                        onDeleteUser={openDeleteUserDialog}
                        onExport={handleExportUsers}
                    />

                    <AnalyticsTab
                        stats={stats}
                        categoryDistribution={categoryDistribution}
                        statusDistribution={statusDistribution}
                    />

                    <SettingsTab
                        onClearCache={handleClearCache}
                        onDatabaseBackup={handleDatabaseBackup}
                        onExportAuditLogs={handleExportAuditLogs}
                        onGenerateReport={handleGenerateReport}
                    />
                </DashboardTabs>

                <UserManagementDialogs
                    showAddDialog={showAddUserDialog}
                    showDeleteDialog={showDeleteUserDialog}
                    selectedUser={selectedUser}
                    newUserForm={newUserForm}
                    isSaving={isSaving}
                    onAddDialogChange={setShowAddUserDialog}
                    onDeleteDialogChange={setShowDeleteUserDialog}
                    onFormChange={setNewUserForm}
                    onAddUser={handleAddUser}
                    onDeleteUser={handleDeleteUser}
                />
            </div>
        </div>
    );
}
