import { createFileRoute } from "@tanstack/react-router";
import { FactoryOrdersPage } from "@/pages/FactoryOrders/FactoryOrders";
import { ProtectedRoute } from "@/components/common/protected-route";
import { PERMISSIONS } from "@/lib/permissions";

export const Route = createFileRoute("/app/factory-orders")({
  component: () => (
    <ProtectedRoute permissions={[PERMISSIONS.FACTORY_ORDER_VIEW]}>
      <FactoryOrdersPage />
    </ProtectedRoute>
  ),
});
