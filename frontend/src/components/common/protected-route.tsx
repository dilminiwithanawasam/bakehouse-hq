import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/services/mockData";
import { Skeleton } from "@/components/ui/skeleton";
import { hasPermission, type Permission } from "@/lib/permissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: Role[];
  permissions?: Permission[];
  fallbackPath?: string;
  requireAll?: boolean;
}

export function ProtectedRoute({
  children,
  roles,
  permissions,
  fallbackPath = "/unauthorized",
  requireAll = true,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const roleAllowed = roles ? roles.includes(user?.role as Role) : true;
  const permissionAllowed = permissions
    ? requireAll
      ? permissions.every((permission) => hasPermission(user?.role as Role | null, permission))
      : permissions.some((permission) => hasPermission(user?.role as Role | null, permission))
    : true;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.navigate({ to: "/login" });
      return;
    }
    if (!roleAllowed || !permissionAllowed) {
      router.navigate({ to: fallbackPath });
    }
  }, [user, loading, roleAllowed, permissionAllowed, router, fallbackPath]);

  if (loading || !user) {
    return (
      <div className="min-h-screen p-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }
  if (!roleAllowed || !permissionAllowed) return null;
  return <>{children}</>;
}
