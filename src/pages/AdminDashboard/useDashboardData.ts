/**
 * Custom hook for Admin Dashboard data management
 * Encapsulates data fetching, filtering, and state management
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
    Complaint,
    User,
    DashboardStats,
    CategoryDistribution,
    StatusDistribution,
    DashboardFilters
} from './dashboard.types';
import {
    calculateDashboardStats,
    calculateCategoryDistribution,
    calculateStatusDistribution,
    filterComplaints,
    filterUsers,
} from './dashboard.selectors';
import { fetchComplaints, fetchUsers } from './dashboard.service';

interface UseDashboardDataReturn {
    // Loading states
    loading: boolean;
    refreshing: boolean;

    // Raw data
    complaints: Complaint[];
    users: User[];

    // Computed data
    stats: DashboardStats;
    categoryDistribution: CategoryDistribution;
    statusDistribution: StatusDistribution;

    // Filtered data
    filteredComplaints: Complaint[];
    filteredUsers: User[];

    // Filters
    filters: DashboardFilters;
    setComplaintSearchQuery: (query: string) => void;
    setComplaintStatusFilter: (status: string) => void;
    setUserSearchQuery: (query: string) => void;
    setUserRoleFilter: (role: string) => void;

    // Actions
    loadData: (showLoader?: boolean) => Promise<void>;
    refreshData: () => Promise<void>;
}

export function useDashboardData(): UseDashboardDataReturn {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    const [filters, setFilters] = useState<DashboardFilters>({
        complaint: { searchQuery: '', status: 'all' },
        user: { searchQuery: '', role: 'all' },
    });

    // Compute dashboard statistics
    const stats = useMemo(
        () => calculateDashboardStats(complaints, users),
        [complaints, users]
    );

    // Compute distributions
    const categoryDistribution = useMemo(
        () => calculateCategoryDistribution(complaints),
        [complaints]
    );

    const statusDistribution = useMemo(
        () => calculateStatusDistribution(complaints),
        [complaints]
    );

    // Apply filters
    const filteredComplaints = useMemo(
        () => filterComplaints(
            complaints,
            filters.complaint.searchQuery,
            filters.complaint.status
        ),
        [complaints, filters.complaint]
    );

    const filteredUsers = useMemo(
        () => filterUsers(
            users,
            filters.user.searchQuery,
            filters.user.role
        ),
        [users, filters.user]
    );

    // Load data from API
    const loadData = useCallback(async (showLoader = true) => {
        try {
            if (showLoader) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            const [fetchedComplaints, fetchedUsers] = await Promise.all([
                fetchComplaints(),
                fetchUsers(),
            ]);

            setComplaints(fetchedComplaints);
            setUsers(fetchedUsers);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            throw error;
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Convenience method for refresh
    const refreshData = useCallback(() => loadData(false), [loadData]);

    // Initial load
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Filter update methods
    const setComplaintSearchQuery = useCallback((query: string) => {
        setFilters(prev => ({
            ...prev,
            complaint: { ...prev.complaint, searchQuery: query },
        }));
    }, []);

    const setComplaintStatusFilter = useCallback((status: string) => {
        setFilters(prev => ({
            ...prev,
            complaint: { ...prev.complaint, status },
        }));
    }, []);

    const setUserSearchQuery = useCallback((query: string) => {
        setFilters(prev => ({
            ...prev,
            user: { ...prev.user, searchQuery: query },
        }));
    }, []);

    const setUserRoleFilter = useCallback((role: string) => {
        setFilters(prev => ({
            ...prev,
            user: { ...prev.user, role },
        }));
    }, []);

    return {
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
        loadData,
        refreshData,
    };
}
