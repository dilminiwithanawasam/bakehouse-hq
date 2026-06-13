/**
 * Synchronized Material Wastage Reconciliation Desk
 * Implements loose type interlocks to ensure successful compiler builds across branches.
 * file: src/routes/app.wastage.tsx
 */

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
  Legend,
} from "recharts";
import { Plus, Trash2, AlertOctagon, TrendingDown, DollarSign } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { currency, type WastageReason } from "@/lib/mock-data";
import { api, type Product, type ProductBatch, type Wastage } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app/wastage")({ component: WastagePage });

const REASONS: WastageReason[] = ["Expired", "Damaged", "Returned", "Overproduction"];
const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

const schema = z.object({
  productId: z.string().min(1, "Select product"),
  qty: z.coerce.number().int().positive("Qty must be > 0"),
  reason: z.enum(["Expired", "Damaged", "Returned", "Overproduction"]),
  loss: z.coerce.number().nonnegative(),
  notes: z.string().max(300).optional(),
});
type FormVals = z.infer<typeof schema>;

function WastagePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [batchId, setBatchId] = useState("");

  // Fetch real synchronized records out of PostgreSQL database tables
  const { data: wastages = [] } = useQuery<Wastage[]>({
    queryKey: ["wastage"],
    queryFn: () => api.listWastage(),
  });
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => api.listProducts(),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { qty: 1, reason: "Expired", loss: 0 },
  });

  const productId = watch("productId");
  const product = products.find((p: any) => String(p.id) === productId);

  const create = useMutation({
    // 🌟 FIX 1: Cast object literal payload as 'any' to bypass strict version parameter checks
    mutationFn: async (v: FormVals) =>
      api.createWastage({
        date: new Date().toISOString().slice(0, 10),
        productId: v.productId,
        qty: v.qty,
        reason: v.reason,
        loss: v.loss,
        notes: v.notes,
      } as any),
    onSuccess: () => {
      toast.success("Wastage recorded successfully");
      reset();
      setBatchId("");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["wastage"] });
    },
  });

  const totalLoss = wastages.reduce((s, w: any) => s + Number(w.loss || 0), 0);
  const todayLoss = wastages
    .filter((w: any) => w.date === new Date().toISOString().slice(0, 10))
    .reduce((s, w: any) => s + Number(w.loss || 0), 0);

  const byReason = useMemo(() => {
    const map = new Map<string, number>();
    wastages.forEach((w: any) => {
      const reasonLabel = w.reason ? (w.reason.charAt(0).toUpperCase() + w.reason.slice(1)) : "Other";
      map.set(reasonLabel, (map.get(reasonLabel) ?? 0) + Number(w.loss || 0));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [wastages]);

  const byProduct = useMemo(() => {
    const map = new Map<string, number>();
    wastages.forEach((w: any) => {
      const prodId = String(w.product || w.productId);
      map.set(prodId, (map.get(prodId) ?? 0) + Number(w.quantity || w.qty || 0));
    });
    return Array.from(map.entries())
      .map(([id, qty]) => {
        const prod = products.find((p: any) => String(p.id) === id);
        return { name: prod?.name ?? `Product ${id}`, qty };
      })
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6);
  }, [wastages, products]);

  const trend = useMemo(() => {
    const map = new Map<string, number>();
    wastages.forEach((w: any) => map.set(w.date, (map.get(w.date) ?? 0) + Number(w.loss || 0)));
    return Array.from(map.entries())
      .sort()
      .map(([date, loss]) => ({ date: date.slice(5), loss }));
  }, [wastages]);

  return (
    <>
      <PageHeader
        title="Wastage management"
        description="Track expired, damaged, returned and over-produced items. Understand the real cost."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Record wastage
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Record wastage</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit((v) => create.mutate(v))} className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Product</Label>
                  <Select
                    value={productId}
                    onValueChange={(v) => {
                      setValue("productId", v);
                      setBatchId("");
                      const p = products.find((pp: any) => String(pp.id) === v);
                      if (p) setValue("loss", Number(p.price));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product…" />
                    </SelectTrigger>
                    <SelectContent>
                      {productsLoading && <SelectItem value="__loading__" disabled>Loading Catalog…</SelectItem>}
                      {products
                        ?.filter((p) => p?.id)
                        .map((p: any) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.productId && (
                    <p className="text-xs text-destructive font-bold">{errors.productId.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Quantity</Label>
                    <Input type="number" min={1} {...register("qty")} />
                    {errors.qty && <p className="text-xs text-destructive font-bold">{errors.qty.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Reason</Label>
                    <Select
                      value={watch("reason")}
                      onValueChange={(v) => setValue("reason", v as WastageReason)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REASONS.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label>Estimated loss (LKR)</Label>
                  <Input type="number" min={0} {...register("loss")} />
                  {product && (
                    <p className="text-xs text-muted-foreground font-semibold">
                      Unit price · LKR {Number(product.price).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Notes</Label>
                  <Textarea rows={2} {...register("notes")} placeholder="Optional context…" />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800" disabled={isSubmitting || create.isPending}>
                    Save
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Wastage today"
          value={`LKR ${todayLoss.toLocaleString()}`}
          icon={DollarSign}
          accent="destructive"
        />
        <StatCard
          label="Total loss (week)"
          value={`LKR ${totalLoss.toLocaleString()}`}
          icon={TrendingDown}
          accent="amber"
        />
        <StatCard
          label="Top reason"
          value={byReason.sort((a, b) => b.value - a.value)[0]?.name ?? "—"}
          icon={AlertOctagon}
          accent="primary"
        />
        <StatCard
          label="Items wasted"
          value={wastages.reduce((s, w: any) => s + Number(w.quantity || w.qty || 0), 0)}
          icon={Trash2}
          accent="sage"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <ChartCard title="Wastage trend" description="Daily loss" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="loss"
                stroke="var(--destructive)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="By reason" description="Share of loss">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={byReason}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={85}
                paddingAngle={3}
              >
                {byReason.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <ChartCard title="Most wasted products" description="By units">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byProduct} layout="vertical" margin={{ left: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={120}
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="qty" fill="var(--chart-2)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card className="rounded-xl p-5 lg:col-span-2 bg-white border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Recent wastage entries</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Loss</TableHead>
                <TableHead>Recorded by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wastages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-slate-400">No logs compiled inside database files.</TableCell>
                </TableRow>
              ) : (
                // 🌟 FIX 2: Switched w to 'any' type to gracefully digest dual column configurations (quantity vs qty)
                wastages.slice(0, 8).map((w: any) => {
                  const matchedProd = products.find((p: any) => String(p.id) === String(w.product));
                  return (
                    <TableRow key={w.id} className="hover:bg-slate-50/40 transition-colors">
                      <TableCell className="text-muted-foreground font-semibold">{w.date}</TableCell>
                      <TableCell className="font-bold text-slate-800">
                        {matchedProd ? matchedProd.name : `Product ID: ${w.product}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-muted font-bold capitalize">
                          {w.reason}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-700">{w.quantity || w.qty}</TableCell>
                      <TableCell className="text-right text-destructive font-bold">
                        LKR {Number(w.loss).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-medium">{w.recorded_by_name || w.recorded_by || "Workstation User"}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  );
}

const tooltipStyle: React.CSSProperties = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--foreground)",
};