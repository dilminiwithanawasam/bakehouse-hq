import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ResetPasswordPage } from "@/pages/ResetPassword/ResetPassword";

const searchSchema = z.object({
  uid: z.string().default(""),
  token: z.string().default(""),
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search) => searchSchema.parse(search),
  component: function ResetPasswordRoute() {
    const { uid, token } = Route.useSearch();
    return <ResetPasswordPage uid={uid} token={token} />;
  },
});
