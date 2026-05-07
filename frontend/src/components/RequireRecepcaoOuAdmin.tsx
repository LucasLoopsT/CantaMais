import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { readStoredUser } from "./RequireAdmin";

export function isRecepcaoOuAdmin(): boolean {
  const l = readStoredUser()?.level;
  return l === "ADMIN" || l === "RECEPCAO";
}

export default function RequireRecepcaoOuAdmin({
  children,
}: {
  children: ReactNode;
}) {
  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }
  if (!isRecepcaoOuAdmin()) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <>{children}</>;
}
