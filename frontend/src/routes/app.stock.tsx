import { createFileRoute } from "@tanstack/react-router";
import { StockPage } from "@/pages/Stock/Stock";
import { ProtectedRoute } from "@/components/common/protected-route";
import { PERMISSIONS } from "@/lib/permissions";

export const Route = createFileRoute("/app/stock")({
  component: () => (
    <ProtectedRoute permissions={[PERMISSIONS.BATCH_VIEW]}>
      <StockPage />
    </ProtectedRoute>
  ),
});
