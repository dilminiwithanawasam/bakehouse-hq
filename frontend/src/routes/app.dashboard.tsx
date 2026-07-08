import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/Dashboard/Dashboard";
import { ProtectedRoute } from "@/components/common/protected-route";
import { PERMISSIONS } from "@/lib/permissions";

export const Route = createFileRoute("/app/dashboard")({
  component: () => (
    <ProtectedRoute permissions={[PERMISSIONS.DASHBOARD_VIEW]}>
      <DashboardPage />
    </ProtectedRoute>
  ),
});
