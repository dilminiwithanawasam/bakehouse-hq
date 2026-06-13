import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export function HomePage() {
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
