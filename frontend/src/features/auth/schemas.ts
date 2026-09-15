/**
 * Auth feature — Zod schemas for form validation.
 *
 * These schemas validate UX inputs only. Business rules
 * (e.g. password complexity) are enforced by the backend.
 * We map backend Problem Detail errors to fields on the client.
 */

import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128, "Password must be at most 128 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  organizationName: z
    .string()
    .max(100, "Organization name must be at most 100 characters")
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
