import { createFileRoute } from "@tanstack/react-router";
import { OrdersPage } from "@/pages/Orders/Orders";
import { ProtectedRoute } from "@/components/common/protected-route";
import { PERMISSIONS } from "@/lib/permissions";

export const Route = createFileRoute("/app/orders")({
  component: () => (
    <ProtectedRoute permissions={[PERMISSIONS.ORDER_VIEW]}>
      <OrdersPage />
    </ProtectedRoute>
  ),
});
