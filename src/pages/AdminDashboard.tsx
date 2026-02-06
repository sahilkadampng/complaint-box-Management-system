/**
 * Admin Dashboard - Entry Point
 * 
 * REFACTORED FOR PRODUCTION:
 * This dashboard has been completely restructured for maintainability,
 * performance, and scalability.
 * 
 * Architecture:
 * - /AdminDashboard/index.tsx - Main component orchestration
 * - /AdminDashboard/dashboard.types.ts - Type definitions
 * - /AdminDashboard/dashboard.service.ts - API & export operations
 * - /AdminDashboard/dashboard.selectors.ts - Data transformations & filtering
 * - /AdminDashboard/useDashboardData.ts - Custom hook for data management
 * - /AdminDashboard/components/* - UI components (memoized)
 * 
 * Key Improvements:
 * ✓ Separation of concerns (business logic vs presentation)
 * ✓ Memoized components prevent unnecessary re-renders
 * ✓ Centralized data fetching with custom hook
 * ✓ Type-safe operations with enums and strict types
 * ✓ Pure functions for calculations (testable)
 * ✓ Scalable component structure
 * 
 * Security Notes:
 * - All user data is considered sensitive
 * - Admin operations are auditable
 * - Form validation is centralized
 */

// Re-export the refactored dashboard from the AdminDashboard folder
export { default } from './AdminDashboard/index';
