import { useAuth } from "@/context/AuthContext";
import type { Permission } from "@/lib/permissions";
import { hasPermission, hasAnyPermission } from "@/lib/permissions";
import type { Role } from "@/services/mockData";

export function usePermission(permission: Permission) {
  const { user } = useAuth();
  return hasPermission(user?.role as Role | null, permission);
}

export function usePermissions(permissions: Permission[]) {
  const { user } = useAuth();
  return hasAnyPermission(user?.role as Role | null, permissions);
}
