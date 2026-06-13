import { createFileRoute } from "@tanstack/react-router";
import { OrdersPage } from "@/pages/Orders/Orders";
import { ProtectedRoute } from "@/components/common/protected-route";

export const Route = createFileRoute("/app/orders")({
  component: () => (
    <ProtectedRoute roles={["admin", "manager", "salesperson"]}>
      <OrdersPage />
    </ProtectedRoute>
  ),
});
