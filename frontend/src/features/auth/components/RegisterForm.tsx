"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Shared register form component.
 * UI only — no auth logic. Backend handles validation/registration.
 * Maps Problem Detail errors from backend to form fields.
 */
export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError(null);
    setFieldErrors({});

    // Client-side validation
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Name is required";
    if (!email.trim()) errors.email = "Email is required";
    if (password.length < 12)
      errors.password = "Password must be at least 12 characters";
    if (password !== confirmPassword)
      errors.confirmPassword = "Passwords do not match";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }

    // TODO: Phase 1 — call auth API
    console.log("Register submitted:", {
      name,
      email,
      password,
      organizationName,
    });

    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmitting(false);
    setServerError("Registration not yet implemented (Phase 1).");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {serverError && (
        <div
          className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300"
          role="alert"
        >
          {serverError}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label
          htmlFor="register-name"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Name
        </label>
        <input
          id="register-name"
          type="text"
          required
          autoComplete="name"
          placeholder="Alex Smith"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!fieldErrors.name}
          aria-describedby={fieldErrors.name ? "register-name-error" : undefined}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
        {fieldErrors.name && (
          <p id="register-name-error" className="text-xs text-red-600" role="alert">
            {fieldErrors.name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="register-email"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Email
        </label>
        <input
          id="register-email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? "register-email-error" : undefined}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
        {fieldErrors.email && (
          <p id="register-email-error" className="text-xs text-red-600" role="alert">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="register-password"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Password
        </label>
        <input
          id="register-password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Min. 12 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!fieldErrors.password}
          aria-describedby={fieldErrors.password ? "register-password-error" : undefined}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
        {fieldErrors.password && (
          <p id="register-password-error" className="text-xs text-red-600" role="alert">
            {fieldErrors.password}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="register-confirm-password"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Confirm password
        </label>
        <input
          id="register-confirm-password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="••••••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          aria-invalid={!!fieldErrors.confirmPassword}
          aria-describedby={
            fieldErrors.confirmPassword ? "register-confirm-password-error" : undefined
          }
          className="rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
        {fieldErrors.confirmPassword && (
          <p
            id="register-confirm-password-error"
            className="text-xs text-red-600"
            role="alert"
          >
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="register-org"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Organization name{" "}
          <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="register-org"
          type="text"
          autoComplete="organization"
          placeholder="Acme Inc."
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
          Sign in
        </Link>
      </p>
    </form>
  );
}
