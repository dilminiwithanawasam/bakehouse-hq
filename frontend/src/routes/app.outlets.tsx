import { createFileRoute } from "@tanstack/react-router";
import { OutletsPage } from "@/pages/Outlets/Outlets";
import { ProtectedRoute } from "@/components/common/protected-route";

export const Route = createFileRoute("/app/outlets")({
  component: () => (
    <ProtectedRoute roles={["admin", "manager"]}>
      <OutletsPage />
    </ProtectedRoute>
  ),
});
