import { createFileRoute } from "@tanstack/react-router";
import { UsersPage } from "@/pages/Users/Users";
import { ProtectedRoute } from "@/components/common/protected-route";

export const Route = createFileRoute("/app/users")({
  component: () => (
    <ProtectedRoute roles={["admin"]}>
      <UsersPage />
    </ProtectedRoute>
  ),
});
