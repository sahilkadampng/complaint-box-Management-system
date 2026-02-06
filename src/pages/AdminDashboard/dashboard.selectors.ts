/**
 * Selectors and utility functions for Admin Dashboard
 * Pure functions for data transformation, filtering, and calculations
 */

import type {
    Complaint,
    User,
    DashboardStats,
    CategoryDistribution,
    StatusDistribution
} from './dashboard.types';

const DAYS_IN_MONTH = 30;
const ACTIVE_USER_PERCENTAGE = 0.75; // Placeholder until real activity tracking

/**
 * Calculate dashboard statistics from raw complaints and users data
 */
export function calculateDashboardStats(
    complaints: Complaint[],
    users: User[]
): DashboardStats {
    const totalComplaints = complaints.length;
    const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
    const escalatedCount = complaints.filter(c => c.status === 'escalated').length;
    const pendingCount = complaints.filter(
        c => !['resolved', 'escalated'].includes(c.status)
    ).length;

    const facultyCount = users.filter(u => u.role === 'faculty').length;
    const recentlyJoinedCount = countRecentlyJoinedUsers(users, DAYS_IN_MONTH);

    const resolutionRate = totalComplaints > 0
        ? Math.round((resolvedCount / totalComplaints) * 100)
        : 0;

    return {
        totalComplaints,
        pendingComplaints: pendingCount,
        resolvedComplaints: resolvedCount,
        escalatedComplaints: escalatedCount,
        totalUsers: users.length,
        totalFaculty: facultyCount,
        activeUsers: Math.round(users.length * ACTIVE_USER_PERCENTAGE),
        recentlyJoined: recentlyJoinedCount,
        resolutionRate,
        avgResolutionTime: 0, // TODO: Calculate from actual resolution timestamps
        avgResponseTime: 2.5,  // TODO: Calculate from actual response data
    };
}

/**
 * Calculate complaints grouped by category
 */
export function calculateCategoryDistribution(
    complaints: Complaint[]
): CategoryDistribution {
    return complaints.reduce<CategoryDistribution>((acc, complaint) => {
        const category = complaint.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {});
}

/**
 * Calculate complaints grouped by status
 */
export function calculateStatusDistribution(
    complaints: Complaint[]
): StatusDistribution {
    return complaints.reduce<StatusDistribution>((acc, complaint) => {
        const status = complaint.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});
}

/**
 * Filter complaints by search query and status
 */
export function filterComplaints(
    complaints: Complaint[],
    searchQuery: string,
    statusFilter: string
): Complaint[] {
    let filtered = complaints;

    if (statusFilter !== 'all') {
        filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(c =>
            c.title.toLowerCase().includes(query) ||
            c.studentName.toLowerCase().includes(query) ||
            c.category.toLowerCase().includes(query)
        );
    }

    return filtered;
}

/**
 * Filter users by search query and role
 */
export function filterUsers(
    users: User[],
    searchQuery: string,
    roleFilter: string
): User[] {
    let filtered = users;

    if (roleFilter !== 'all') {
        filtered = filtered.filter(u => u.role === roleFilter);
    }

    if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(u =>
            u.name.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            u.username.toLowerCase().includes(query)
        );
    }

    return filtered;
}

/**
 * Get CSS classes for complaint status badge
 */
export function getStatusColorClass(status: string): string {
    const colorMap: Record<string, string> = {
        submitted: 'bg-blue-100 text-blue-700 border-blue-200',
        in_review: 'bg-amber-100 text-amber-700 border-amber-200',
        need_clarification: 'bg-purple-100 text-purple-700 border-purple-200',
        assigned: 'bg-cyan-100 text-cyan-700 border-cyan-200',
        resolved: 'bg-green-100 text-green-700 border-green-200',
        escalated: 'bg-red-100 text-red-700 border-red-200',
    };

    return colorMap[status] || 'bg-gray-100 text-gray-700 border-gray-200';
}

/**
 * Count users who joined within the specified number of days
 */
function countRecentlyJoinedUsers(users: User[], days: number): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return users.filter(u => {
        try {
            return new Date(u.createdAt) > cutoffDate;
        } catch {
            return false;
        }
    }).length;
}

/**
 * Validate new user form data
 */
export function validateUserForm(form: {
    name: string;
    email: string;
    username: string;
    password: string;
}): { valid: boolean; error?: string } {
    if (!form.name?.trim() || !form.email?.trim() || !form.username?.trim() || !form.password) {
        return { valid: false, error: 'Please fill in all required fields' };
    }

    if (form.password.length < 6) {
        return { valid: false, error: 'Password must be at least 6 characters' };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
        return { valid: false, error: 'Please enter a valid email address' };
    }

    return { valid: true };
}
