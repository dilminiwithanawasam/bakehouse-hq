import { createFileRoute } from "@tanstack/react-router";
import { UnauthorizedPage } from "@/pages/Unauthorized/Unauthorized";

export const Route = createFileRoute("/unauthorized")({
  component: UnauthorizedPage,
});
