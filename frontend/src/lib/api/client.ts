import type { ProblemDetail } from "@/types/api";

/**
 * Custom error class for API errors.
 * Wraps RFC 7807 Problem Details returned by the backend.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly errors: ProblemDetail["errors"];
  readonly traceId?: string;
  readonly problemDetail: ProblemDetail;

  constructor(problemDetail: ProblemDetail) {
    super(problemDetail.title);
    this.name = "ApiError";
    this.status = problemDetail.status;
    this.code = problemDetail.code;
    this.errors = problemDetail.errors;
    this.traceId = problemDetail.traceId;
    this.problemDetail = problemDetail;
  }
}

/**
 * Typed fetcher that talks to the backend via the same-origin proxy.
 *
 * - Always sends credentials (cookies) for same-origin requests.
 * - Parses Problem Detail responses into `ApiError`.
 * - Throws on non-OK responses.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `/api/backend${path}`;

  const headers = new Headers(options.headers);

  // Anti-CSRF header required by backend for mutations (API.md §3)
  if (!options.method || options.method.toUpperCase() !== "GET") {
    headers.set("X-Requested-With", "fetch");
  }

  // Default Content-Type for JSON bodies (unless FormData)
  if (
    options.body &&
    typeof options.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "same-origin",
  });

  if (!response.ok) {
    let problemDetail: ProblemDetail;

    try {
      problemDetail = (await response.json()) as ProblemDetail;
    } catch {
      // Fallback if response is not valid JSON
      problemDetail = {
        type: "about:blank",
        title: response.statusText || "Request failed",
        status: response.status,
        code: "UNKNOWN_ERROR",
      };
    }

    throw new ApiError(problemDetail);
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/**
 * Helper to extract field-level validation errors from an ApiError.
 * Returns a map of field name → error message.
 */
export function getFieldErrors(
  error: ApiError,
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (error.errors) {
    for (const err of error.errors) {
      fieldErrors[err.field] = err.message;
    }
  }

  return fieldErrors;
}
