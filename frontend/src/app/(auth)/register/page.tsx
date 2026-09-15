import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components";

export const metadata: Metadata = {
  title: "Create account — Feedback Platform",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
