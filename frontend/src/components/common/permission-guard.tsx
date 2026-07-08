import { type ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/services/mockData";
import { type Permission, hasAllPermissions, hasAnyPermission } from "@/lib/permissions";

interface PermissionGuardProps {
  children: ReactNode;
  permissions: Permission[];
  fallbackPath?: string;
  requireAll?: boolean;
}

export function PermissionGuard({
  children,
  permissions,
  fallbackPath = "/unauthorized",
  requireAll = true,
}: PermissionGuardProps) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const allowed = requireAll
    ? hasAllPermissions(user.role as Role | null, permissions)
    : hasAnyPermission(user.role as Role | null, permissions);

  if (!allowed) return <Navigate to={fallbackPath} replace />;

  return <>{children}</>;
}
