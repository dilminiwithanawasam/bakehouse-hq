import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    router.navigate({ to: user ? "/app/dashboard" : "/login" });
  }, [user, loading, router]);
  return (
    <div className="min-h-screen grid place-items-center bg-background">
      <div className="text-sm text-muted-foreground">Loading…</div>
    </div>
  );
}
