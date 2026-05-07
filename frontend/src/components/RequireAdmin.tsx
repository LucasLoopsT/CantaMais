import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

export function readStoredUser(): { level: string } | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const u = JSON.parse(raw) as { level?: string };
    if (typeof u.level !== "string") return null;
    return { level: u.level };
  } catch {
    return null;
  }
}

export function isAdminUser(): boolean {
  return readStoredUser()?.level === "ADMIN";
}

export default function RequireAdmin({ children }: { children: ReactNode }) {
  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdminUser()) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <>{children}</>;
}
