import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app/settings")({ component: SettingsPage });

function SettingsPage() {
  const { user } = useAuth();
  const [outlet, setOutlet] = useState("Sunrise Bakery — Bandra Outlet");
  const [currency, setCurrency] = useState("INR");
  const [theme, setTheme] = useState(false);
  const [emails, setEmails] = useState(true);
  const [push, setPush] = useState(false);

  const save = () => toast.success("Settings saved");

  return (
    <>
      <PageHeader title="Settings" description="Outlet, formatting and notification preferences." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="rounded-xl p-6 lg:col-span-2 space-y-5">
          <div>
            <h3 className="font-semibold">Outlet information</h3>
            <p className="text-xs text-muted-foreground mt-1">MVP supports a single outlet.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Outlet name</Label>
              <Input value={outlet} onChange={(e) => setOutlet(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR — Indian Rupee (₹)</SelectItem>
                  <SelectItem value="USD">USD — US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">EUR — Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-xs text-muted-foreground mt-1">How you'd like to be alerted.</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="text-sm font-medium">Email digests</div>
                <div className="text-xs text-muted-foreground">Daily summary of sales and wastage</div>
              </div>
              <Switch checked={emails} onCheckedChange={setEmails} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="text-sm font-medium">Push alerts</div>
                <div className="text-xs text-muted-foreground">Low-stock and critical events</div>
              </div>
              <Switch checked={push} onCheckedChange={setPush} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="text-sm font-medium">Dark mode</div>
                <div className="text-xs text-muted-foreground">Use a warmer dark theme</div>
              </div>
              <Switch checked={theme} onCheckedChange={(c) => {
                setTheme(c);
                document.documentElement.classList.toggle("dark", c);
              }} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={save}>Save changes</Button>
          </div>
        </Card>

        <Card className="rounded-xl p-6 space-y-4 h-fit">
          <h3 className="font-semibold">Your account</h3>
          <div className="text-sm space-y-1">
            <div className="text-muted-foreground text-xs">Name</div>
            <div className="font-medium">{user?.name}</div>
          </div>
          <div className="text-sm space-y-1">
            <div className="text-muted-foreground text-xs">Email</div>
            <div className="font-medium">{user?.email}</div>
          </div>
          <div className="text-sm space-y-1">
            <div className="text-muted-foreground text-xs">Role</div>
            <div className="font-medium capitalize">{user?.role}</div>
          </div>
          <Button variant="outline" className="w-full">Change password</Button>
        </Card>
      </div>
    </>
  );
}
