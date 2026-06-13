import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/pages/Login/Login";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});
