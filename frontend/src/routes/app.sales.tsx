import { createFileRoute } from "@tanstack/react-router";
import { SalesPage } from "@/pages/Sales/Sales";
import { ProtectedRoute } from "@/components/common/protected-route";
import { PERMISSIONS } from "@/lib/permissions";

export const Route = createFileRoute("/app/sales")({
  component: () => (
    <ProtectedRoute permissions={[PERMISSIONS.SALES_CREATE]}>
      <SalesPage />
    </ProtectedRoute>
  ),
});
