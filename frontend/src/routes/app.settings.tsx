import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/pages/Settings/Settings";
import { ProtectedRoute } from "@/components/common/protected-route";
import { PERMISSIONS } from "@/lib/permissions";

export const Route = createFileRoute("/app/settings")({
  component: () => (
    <ProtectedRoute permissions={[PERMISSIONS.SETTINGS_VIEW]}>
      <SettingsPage />
    </ProtectedRoute>
  ),
});
