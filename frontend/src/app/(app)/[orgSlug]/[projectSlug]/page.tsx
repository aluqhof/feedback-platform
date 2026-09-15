import { use } from "react";

/**
 * Dashboard placeholder for [orgSlug]/[projectSlug].
 *
 * Phase 1: org selector + project list.
 * Phase 2: feedback inbox.
 */
export default function DashboardPage(props: {
  params: Promise<{ orgSlug: string; projectSlug: string }>;
}) {
  const { orgSlug, projectSlug } = use(props.params);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        Dashboard
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Project workspace placeholder. Phase 1 will add the full dashboard.
      </p>
      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500">
          Route params:
        </p>
        <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          {JSON.stringify({ orgSlug, projectSlug }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
