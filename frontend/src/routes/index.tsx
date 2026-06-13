import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/pages/Home/Home";

export const Route = createFileRoute("/")({
  component: HomePage,
});
