/**
 * Auth feature — API calls.
 *
 * All paths are relative to the backend proxy (`/api/backend`).
 * See `src/lib/api/client.ts` for the fetcher.
 */

import { apiFetch } from "@/lib/api/client";
import type {
  LoginRequest,
  MeResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/types/api";

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function login(data: LoginRequest): Promise<void> {
  await apiFetch("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function logout(): Promise<void> {
  await apiFetch("/api/v1/auth/logout", {
    method: "POST",
  });
}

export async function getMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>("/api/v1/auth/me");
}
