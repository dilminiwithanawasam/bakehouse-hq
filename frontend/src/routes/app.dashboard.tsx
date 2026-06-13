import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/Dashboard/Dashboard";

export const Route = createFileRoute("/app/dashboard")({
  component: DashboardPage,
});
