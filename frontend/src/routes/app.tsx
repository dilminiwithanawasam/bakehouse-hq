import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/components/common/protected-route";

export const Route = createFileRoute("/app")({
  component: () => (
    <ProtectedRoute>
      <AppShell>
        <Outlet />
      </AppShell>
    </ProtectedRoute>
  ),
});
