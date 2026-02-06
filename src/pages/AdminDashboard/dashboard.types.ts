/**
 * Type definitions for Admin Dashboard
 * Centralized type definitions ensure type safety across the dashboard
 */

// Use const objects instead of enums for better compatibility
export const ComplaintStatus = {
    SUBMITTED: 'submitted',
    IN_REVIEW: 'in_review',
    NEED_CLARIFICATION: 'need_clarification',
    ASSIGNED: 'assigned',
    RESOLVED: 'resolved',
    ESCALATED: 'escalated',
} as const;

export const UserRole = {
    STUDENT: 'student',
    FACULTY: 'faculty',
    ADMIN: 'admin',
} as const;

export type ComplaintStatusType = typeof ComplaintStatus[keyof typeof ComplaintStatus];
export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export interface Complaint {
    _id: string;
    title: string;
    status: string;
    studentName: string;
    category: string;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    department?: string;
    createdAt: string;
}

export interface DashboardStats {
    totalComplaints: number;
    pendingComplaints: number;
    resolvedComplaints: number;
    escalatedComplaints: number;
    totalUsers: number;
    totalFaculty: number;
    avgResolutionTime: number;
    activeUsers: number;
    recentlyJoined: number;
    resolutionRate: number;
    avgResponseTime: number;
}

export interface NewUserForm {
    name: string;
    email: string;
    username: string;
    password: string;
    role: 'student' | 'faculty';
    department: string;
}

export interface CategoryDistribution {
    [category: string]: number;
}

export interface StatusDistribution {
    [status: string]: number;
}

export type DashboardTab = 'overview' | 'complaints' | 'users' | 'analytics' | 'settings';

export interface DashboardFilters {
    complaint: {
        searchQuery: string;
        status: string;
    };
    user: {
        searchQuery: string;
        role: string;
    };
}

export interface DashboardState {
    loading: boolean;
    refreshing: boolean;
    activeTab: DashboardTab;
    stats: DashboardStats;
    complaints: Complaint[];
    users: User[];
    categoryDistribution: CategoryDistribution;
    statusDistribution: StatusDistribution;
}
