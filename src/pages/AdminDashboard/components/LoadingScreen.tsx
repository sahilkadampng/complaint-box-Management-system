/**
 * Loading screen component
 * Displayed while initial dashboard data is being fetched
 */

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-full border-3 border-gray-200 border-t-blue-600 animate-spin"></div>
        <p className="text-sm font-medium text-gray-700">Loading dashboard...</p>
      </div>
    </div>
  );
}
