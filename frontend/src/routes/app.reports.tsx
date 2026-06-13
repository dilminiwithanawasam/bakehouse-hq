import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "@/pages/Reports/Reports";
import { ProtectedRoute } from "@/components/common/protected-route";

export const Route = createFileRoute("/app/reports")({
  component: () => (
    <ProtectedRoute roles={["admin", "manager"]}>
      <ReportsPage />
    </ProtectedRoute>
  ),
});
