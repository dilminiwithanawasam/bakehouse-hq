/**
 * Interactive User Authentication Login Interface
 * Features dynamic input masks and secure eye visibility state controls.
 * file: src/routes/login.tsx
 */

import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Croissant, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({ component: LoginPage });

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(72),
  remember: z.boolean().optional(),
});
type Form = z.infer<typeof schema>;

function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  // 🌟 NEW: Manages password text mask toggle states
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) router.navigate({ to: "/app/dashboard" });
  }, [user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (data: Form) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success("Welcome back");
      router.navigate({ to: "/app/dashboard" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Column: Branding Content Display */}
      <div className="hidden lg:flex relative flex-col justify-between p-12 login-gradient text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-20 login-bg-dots" />
        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur grid place-items-center">
            <Croissant className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">BakeryHUB</span>
        </div>
        <div className="relative space-y-4 max-w-md">
          <h1 className="text-4xl font-black leading-tight tracking-tight">
            Run your bakery with calm clarity.
          </h1>
          <p className="text-primary-foreground/80 text-base leading-relaxed font-medium">
            Track every sale, every loaf, every loss. A modern operations and analytics platform
            built for the bakery floor.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-6">
            {[
              { k: "POS", v: "Sales today" },
              { k: "FIFO", v: "Items sold" },
              { k: "LKR", v: "Wastage logs" },
            ].map((s) => (
              <div
                key={s.v}
                className="rounded-xl bg-white/10 backdrop-blur p-4 border border-white/10 text-center font-bold"
              >
                <div className="text-xl font-black text-amber-300">{s.k}</div>
                <div className="text-[10px] text-primary-foreground/70 mt-1 uppercase tracking-wider">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-primary-foreground/70 font-semibold uppercase tracking-widest">
          © {new Date().getFullYear()} BakeryHUB
        </div>
      </div>

      {/* Right Column: Interaction Form Entry Grid */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
        <Card className="w-full max-w-md p-8 rounded-2xl shadow-sm bg-white border border-slate-100">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="h-9 w-9 rounded-lg bg-slate-900 grid place-items-center text-white">
              <Croissant className="h-5 w-5" />
            </div>
            <span className="font-bold text-slate-800 tracking-tight">BakeryHUB</span>
          </div>

          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Sign in</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Welcome back. Enter your credentials to continue.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {/* Email Field Layout */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-slate-600">Email Address</Label>
              <Input id="email" type="email" autoComplete="email" className="h-10 border-slate-200" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive font-bold">{errors.email.message}</p>}
            </div>

            {/* Password Entry Layout Box */}
            <div className="space-y-1.5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold text-slate-600">Password</Label>
                  <Link to="/forgot-password" className="text-xs font-bold text-amber-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                
                {/* 🌟 NEW: Absolute-positioned container framing the dynamic input mask field view toggle */}
                <div className="relative">
                  <Input
                    id="password"
                    // Switches dynamically based on interactive state values
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="h-10 border-slate-200 pr-10 font-mono text-sm"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password text" : "Reveal password text"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive font-bold">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 py-1">
              <Checkbox
                id="remember"
                checked={!!watch("remember")}
                onCheckedChange={(c) => setValue("remember", !!c)}
              />
              <Label htmlFor="remember" className="text-xs font-bold text-slate-500 cursor-pointer select-none">
                Remember me on this device
              </Label>
            </div>

            <Button type="submit" className="w-full h-11 text-sm font-bold text-white bg-slate-950 hover:bg-slate-800 transition-colors shadow-sm" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Sign in"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}