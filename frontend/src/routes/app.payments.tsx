import { createFileRoute } from "@tanstack/react-router";
import { PaymentsPage } from "@/pages/Payments/Payments";
import { ProtectedRoute } from "@/components/common/protected-route";

export const Route = createFileRoute("/app/payments")({
  component: () => (
    <ProtectedRoute roles={["admin", "manager", "salesperson"]}>
      <PaymentsPage />
    </ProtectedRoute>
  ),
});
