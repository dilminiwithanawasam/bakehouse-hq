import { createFileRoute } from "@tanstack/react-router";
import { SalesPage } from "@/pages/Sales/Sales";

export const Route = createFileRoute("/app/sales")({
  component: SalesPage,
});
