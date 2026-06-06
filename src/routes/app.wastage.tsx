/**
 * Synchronized Material Wastage Reconciliation Desk
 * DESIGN: Humanized user-friendly bakery terminology with active type conversion handling.
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
import { Plus, Trash2, AlertOctagon, TrendingDown, DollarSign, Loader2 } from "lucide-react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { currency } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// Hook up service layers cleanly
import { 
  listWastage, 
  createWastage, 
  listProducts, 
  listBatches, 
  type Product, 
  type ProductBatch, 
  type Wastage 
} from "@/lib/api-backend";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app/wastage")({ component: WastagePage });

const REASONS = ["Expired", "Damaged", "Returned", "Overproduction"] as const;
const PIE_COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

const schema = z.object({
  productId: z.string().min(1, "Please select a product"),
  batchId: z.string().min(1, "Please select an associated baking batch"),
  qty: z.coerce.number().int().positive("Quantity must be greater than 0"),
  reason: z.enum(["Expired", "Damaged", "Returned", "Overproduction"]),
  notes: z.string().max(300).optional(),
});
type FormVals = z.infer<typeof schema>;

function WastagePage() {
  const { user } = useAuth();
  console.log("Current User:", user);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  // --- LIVE DATA STORAGE PIPELINES ---
  const { data: wastages = [], isLoading: logsLoading } = useQuery<Wastage[], Error>({
    queryKey: ["wastage"],
    queryFn: () => listWastage(),
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: () => listProducts(),
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
    // 🌟 FIXED: Added fallback string assignments to shield schema elements from undefined evaluation loops
    defaultValues: { productId: "", batchId: "", qty: 1, reason: "Expired", notes: "" },
  });

  const productId = watch("productId");
  const batchId = watch("batchId");
  const product = products.find((p) => String(p.id) === productId);

  // REACTIVE BATCH FETCHING: Automatically queries lots matching the active product selection
  const { data: allBatches = [], isLoading: batchesLoading } = useQuery<ProductBatch[], Error>({
    queryKey: ["batches", productId],
    queryFn: () => listBatches({ product: productId }),
    enabled: Boolean(productId),
  });

  // Filter down strictly to unexhausted tracking sequences
  const activeBatches = productId
    ? allBatches.filter((b) => String(b.product) === productId && b.is_active && b.current_quantity > 0)
    : [];

  // --- MUTATION WRITERS: DATA TRANSACTIONS ---
  const createMutation = useMutation({
    mutationFn: async (v: FormVals) => {
      const selectedBatchInstance = activeBatches.find(b => String(b.id) === v.batchId);
      
      // Enforce physical constraints check prior to transmission requests
      if (selectedBatchInstance && v.qty > selectedBatchInstance.current_quantity) {
        throw new Error(`Stock limit error: This batch only has ${selectedBatchInstance.current_quantity} items left.`);
      }

      // Automatically calculate base manufacturing costs or infer values cleanly
      const inferredUnitCost = product ? (product.cost_price || Number(product.price) * 0.65) : 0;

      return createWastage({
        date: new Date().toISOString().slice(0, 10),
        productId: v.productId,
        batchId: v.batchId,
        qty: v.qty,
        reason: v.reason,
        unitCost: inferredUnitCost,
        notes: v.notes,
      });
    },
    onSuccess: () => {
      toast.success("Wastage logged successfully.");
      reset();
      setOpen(false);
      
      // Force programmatic cache invalidation loops to keep charts updated
      qc.invalidateQueries({ queryKey: ["wastage"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["batches-all"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary-kpis"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save wastage entry.");
    }
  });

  // --- ANALYTICAL CHART CALCULATIONS MATRIX ---
  const totalLoss = wastages.reduce((sum, w: any) => sum + Number(w.loss || 0), 0);
  const todayLoss = wastages
    .filter((w: any) => w.date === new Date().toISOString().slice(0, 10))
    .reduce((sum, w: any) => sum + Number(w.loss || 0), 0);

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
        return { name: prod?.name ?? `Product ID #${id}`, qty };
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
        title="Wastage & Loss Records"
        description="Track spoiled, expired, or dropped items to keep your inventory numbers accurate."
        actions={
           ["admin", "manager", "salesperson"].includes(user?.role ?? "") && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-slate-950 text-white font-bold hover:bg-slate-800">
                  <Plus className="h-4 w-4 mr-2" /> Record Wastage
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white max-w-md rounded-2xl border-0 shadow-xl p-6">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black text-slate-800 tracking-tight">Record Wasted Items</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="space-y-4 mt-2">
                  
                  {/* Product Selection */}
                  <div className="space-y-1.5">
                    <Label htmlFor="wastage-product-picker" className="text-xs font-bold text-slate-600">Select Product</Label>
                    {/* 🌟 FIXED: Linked via register containing form lifecycle handler hooks to prevent silent submittal locks */}
                    <select
                      id="wastage-product-picker"
                      {...register("productId", {
                        onChange: (e) => {
                          setValue("productId", e.target.value);
                          setValue("batchId", ""); // Reset downstream lots values
                        }
                      })}
                      title="Choose Target Bakery Product"
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 focus:outline-none"
                    >
                      <option value="">-- Select Product --</option>
                      {productsLoading && <option disabled>Loading system catalog...</option>}
                      {products.filter(p => p.id && p.is_active).map(p => (
                        <option key={p.id} value={String(p.id)}>{p.name}</option>
                      ))}
                    </select>
                    {errors.productId && <p className="text-xs text-red-500 font-bold mt-1">{errors.productId.message}</p>}
                  </div>

                  {/* Batch Link Field Selector */}
                  <div className="space-y-1.5">
                    <Label htmlFor="wastage-batch-picker" className="text-xs font-bold text-slate-600">Baking Batch Reference</Label>
                    {/* 🌟 FIXED: Linked register onto lot option rows context parameters */}
                    <select
                      id="wastage-batch-picker"
                      {...register("batchId", {
                        onChange: (e) => setValue("batchId", e.target.value)
                      })}
                      title="Select Lot reference code"
                      className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 focus:outline-none disabled:opacity-50"
                      disabled={!productId || batchesLoading}
                    >
                      <option value="">-- Select Batch Number --</option>
                      {batchesLoading && <option disabled>Loading active baking batches...</option>}
                      {activeBatches.map(b => (
                        <option key={b.id} value={String(b.id)}>{b.batch_number} ({b.current_quantity} left)</option>
                      ))}
                    </select>
                    {errors.batchId && <p className="text-xs text-red-500 font-bold mt-1">{errors.batchId.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-600">Quantity Lost</Label>
                      <Input type="number" min={1} {...register("qty")} className="h-10 border-slate-200 bg-slate-50 text-xs" />
                      {errors.qty && <p className="text-xs text-red-500 font-bold mt-1">{errors.qty.message}</p>}
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="wastage-reason-picker" className="text-xs font-bold text-slate-600">Reason for Wastage</Label>
                      {/* 🌟 FIXED: Handled reason registration cleanly */}
                      <select
                        id="wastage-reason-picker"
                        {...register("reason", {
                          onChange: (e) => setValue("reason", e.target.value as any)
                        })}
                        title="Select a reason"
                        className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 focus:outline-none"
                      >
                        {REASONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-600">Additional Notes</Label>
                    <Textarea rows={2} {...register("notes")} className="border-slate-200 bg-slate-50 text-sm resize-none" placeholder="Provide any extra details about the loss (e.g., dropped item, box damage)..." />
                    {errors.notes && <p className="text-xs text-red-500 font-bold mt-1">{errors.notes.message}</p>}
                  </div>

                  <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" className="h-10 border-slate-200 font-bold" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    {/* 🌟 FIXED: Changed jargon text from 'Commit Audit Write-Off' to 'Record Wastage' */}
                    <Button type="submit" className="h-10 bg-slate-950 font-bold text-white hover:bg-slate-800" disabled={isSubmitting || createMutation.isPending}>
                      {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Record Wastage"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
      />

      {/* Summary Stat Cards Block */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Wastage logged today" value={`Rs. ${todayLoss.toLocaleString()}`} icon={DollarSign} accent="destructive" />
        <StatCard label="Total loss tracking" value={`Rs. ${totalLoss.toLocaleString()}`} icon={TrendingDown} accent="amber" />
        <StatCard label="Top reason for loss" value={byReason.sort((a, b) => b.value - a.value)[0]?.name ?? "—"} icon={AlertOctagon} accent="primary" />
        <StatCard label="Total items wasted" value={wastages.reduce((sum, w: any) => sum + Number(w.quantity || w.qty || 0), 0)} icon={Trash2} accent="sage" />
      </div>

      {/* Analytical Visual Panels Matrix Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <ChartCard title="Wastage tracking timeline" description="Daily loss values graph" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => `Rs. ${Number(v).toLocaleString()}`} />
              <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} dot={{ r: 4, strokeWidth: 0, fill: "#ef4444" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Wastage breakdown by cause" description="Percentage distribution share of total loss cost">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byReason} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={4}>
                {byReason.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => `Rs. ${Number(v).toLocaleString()}`} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: "bold" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <ChartCard title="Most high-leakage products" description="Total items lost tracking by units">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byProduct} layout="vertical" margin={{ left: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" width={120} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="qty" name="Units Lost" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Data List Table Ledger Grid View */}
        <Card className="rounded-xl p-5 lg:col-span-2 bg-white border border-slate-100 shadow-sm overflow-hidden">
          <h3 className="font-bold text-slate-800 mb-4 text-sm">Recent Wastage Logs</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold text-slate-700">Date Logged</TableHead>
                  <TableHead className="font-bold text-slate-700">Product Name</TableHead>
                  <TableHead className="font-bold text-slate-700">Reason</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">Quantity</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">Total Loss</TableHead>
                  <TableHead className="font-bold text-slate-700">Recorded By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsLoading && <TableRow><TableCell colSpan={6} className="text-center py-6 text-slate-400 font-medium">Loading records...</TableCell></TableRow>}
                {!logsLoading && wastages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-slate-400 font-semibold text-xs">No wastage logs recorded yet.</TableCell>
                  </TableRow>
                ) : (
                  wastages.slice(0, 8).map((w: any) => {
                    const matchedProd = products.find((p: any) => String(p.id) === String(w.product));
                    return (
                      <TableRow key={w.id} className="hover:bg-slate-50/40 text-xs font-semibold transition-colors">
                        <TableCell className="text-muted-foreground font-bold">{w.date}</TableCell>
                        <TableCell className="font-black text-slate-800">
                          <div className="flex flex-col">
                            <span>{matchedProd ? matchedProd.name : `Product ID #${w.product}`}</span>
                            {w.batch_number && <span className="text-[10px] text-amber-700 font-mono font-medium">Batch link: {w.batch_number}</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn(
                            "font-extrabold capitalize border text-[10px]",
                            w.reason === "Expired" ? "bg-amber-50 text-amber-700 border-amber-100" :
                            w.reason === "Damaged" ? "bg-red-50 text-red-700 border-red-100" : "bg-slate-50 text-slate-700 border-slate-100"
                          )}>
                            {w.reason}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-black text-slate-700">{w.quantity || w.qty} units</TableCell>
                        <TableCell className="text-right text-red-600 font-black">
                          Rs. {Number(w.loss).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-muted-foreground font-bold">{w.recorded_by_name || w.recorded_by || "Staff Account"}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </>
  );
}

const tooltipStyle: React.CSSProperties = {
  background: "#0f172a",
  borderRadius: "8px",
  fontSize: "12px",
  fontWeight: "bold",
  color: "#ffffff",
  border: "0",
};