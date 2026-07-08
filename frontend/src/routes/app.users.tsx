import { createFileRoute } from "@tanstack/react-router";
import { UsersPage } from "@/pages/Users/Users";
import { ProtectedRoute } from "@/components/common/protected-route";
import { PERMISSIONS } from "@/lib/permissions";

export const Route = createFileRoute("/app/users")({
  component: () => (
    <ProtectedRoute permissions={[PERMISSIONS.USER_MANAGEMENT]}>
      <UsersPage />
    </ProtectedRoute>
  ),
});
