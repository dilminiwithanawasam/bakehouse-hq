import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "@/pages/Reports/Reports";
import { ProtectedRoute } from "@/components/common/protected-route";
import { PERMISSIONS } from "@/lib/permissions";

export const Route = createFileRoute("/app/reports")({
  component: () => (
    <ProtectedRoute permissions={[PERMISSIONS.REPORT_VIEW]}>
      <ReportsPage />
    </ProtectedRoute>
  ),
});
