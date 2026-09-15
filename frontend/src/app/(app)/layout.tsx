/**
 * App layout — authenticated area with sidebar placeholder.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar placeholder */}
      <aside className="hidden w-64 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 lg:block">
        <div className="flex h-16 items-center border-b border-gray-200 px-4 dark:border-gray-700">
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Feedback Platform
          </span>
        </div>
        <nav className="p-4">
          <p className="text-sm text-gray-500">
            Sidebar — Phase 1
          </p>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
