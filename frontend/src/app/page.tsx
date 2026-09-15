import Link from "next/link";

/**
 * Root page — redirects to login or shows a landing placeholder.
 */
export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Feedback Platform
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Dashboard for managing user feedback with technical context.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
