import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend,
  Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  IndianRupee, ShoppingBag, Trash2, TrendingUp, AlertTriangle, Star,
  Plus, Download, ShoppingCart, Boxes,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import {
  SALES, WASTAGES, PRODUCTS, SALES_BY_HOUR, DAILY_SALES_TREND, CATEGORY_BREAKDOWN,
  currency, productName,
} from "@/lib/mock-data";

export const Route = createFileRoute("/app/dashboard")({ component: DashboardPage });

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === "salesperson" ? <SalespersonDashboard /> : <ExecutiveDashboard />;
}

function ExecutiveDashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const todaySales = SALES.filter(s => s.date === today);
  const totalSalesToday = todaySales.reduce((s, x) => s + x.total, 0);
  const totalItemsToday = todaySales.reduce((s, x) => s + x.items.reduce((a, i) => a + i.qty, 0), 0);
  const wastageCost = WASTAGES.filter(w => w.date === today).reduce((s, w) => s + w.loss, 0);

  const lowStock = PRODUCTS.filter(p => p.stock <= p.minStock);
  const productSales = useMemo(() => {
    const map = new Map<string, number>();
    SALES.forEach(s => s.items.forEach(i => map.set(i.productId, (map.get(i.productId) ?? 0) + i.qty)));
    return Array.from(map.entries())
      .map(([id, qty]) => ({ id, name: productName(id), qty }))
      .sort((a, b) => b.qty - a.qty);
  }, []);
  const best = productSales[0];

  const wastageTrend = useMemo(() => {
    const map = new Map<string, number>();
    WASTAGES.forEach(w => map.set(w.date, (map.get(w.date) ?? 0) + w.loss));
    return Array.from(map.entries()).sort().map(([date, loss]) => ({ date: date.slice(5), loss }));
  }, []);

  return (
    <>
      <PageHeader
        title="Executive dashboard"
        description="Real-time view of outlet performance, inventory and losses."
        actions={
          <>
            <Tabs defaultValue="today">
              <TabsList className="rounded-lg">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Sales today"      value={currency(totalSalesToday || 84320)} delta="+12.4% vs yesterday" trend="up" icon={IndianRupee} />
        <StatCard label="Items sold"       value={totalItemsToday || 382}              delta="+8.1%"                trend="up" icon={ShoppingBag} accent="amber" />
        <StatCard label="Wastage cost"     value={currency(wastageCost || 600)}        delta="-4.2% vs avg"         trend="up" icon={Trash2} accent="destructive" />
        <StatCard label="Net revenue"      value={currency((totalSalesToday || 84320) - (wastageCost || 600))} delta="+11.6%" trend="up" icon={TrendingUp} accent="sage" />
        <StatCard label="Low stock alerts" value={lowStock.length}                     delta={`${lowStock.length} need restock`} trend="down" icon={AlertTriangle} accent="destructive" />
        <StatCard label="Top product"      value={best?.name ?? "—"}                   delta={`${best?.qty ?? 0} sold`} icon={Star} accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <ChartCard title="Daily sales trend" description="Last 14 days" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={DAILY_SALES_TREND}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="revenue" stroke="var(--chart-1)" fill="url(#g1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Category mix" description="Share of revenue">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={CATEGORY_BREAKDOWN} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {CATEGORY_BREAKDOWN.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <ChartCard title="Sales by hour" description="Today's hourly volume">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={SALES_BY_HOUR}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="sales" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Wastage trend" description="Daily loss in INR">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={wastageTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="loss" stroke="var(--destructive)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top selling products" description="All-time units sold">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={productSales.slice(0, 5)} layout="vertical" margin={{ left: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" width={110} stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="qty" fill="var(--chart-1)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Card className="rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent sales</h3>
            <Button variant="ghost" size="sm">View all</Button>
          </div>
          <div className="space-y-2">
            {SALES.slice(0, 6).map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <div className="text-sm font-medium">#{s.id.toUpperCase()} · {s.cashier}</div>
                  <div className="text-xs text-muted-foreground">{s.date} · {s.items.length} items</div>
                </div>
                <div className="text-sm font-semibold">{currency(s.total)}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Stock alerts</h3>
            <Badge variant="secondary" className="bg-destructive/10 text-destructive border-0">{lowStock.length}</Badge>
          </div>
          <div className="space-y-2">
            {lowStock.slice(0, 6).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">Min {p.minStock} · {p.category}</div>
                </div>
                <Badge variant="secondary" className={
                  p.stock === 0
                    ? "bg-destructive/10 text-destructive border-0"
                    : "bg-accent/40 text-foreground border-0"
                }>
                  {p.stock === 0 ? "Out" : `${p.stock} left`}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

function SalespersonDashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const todaySales = SALES.filter(s => s.date === today);
  const total = todaySales.reduce((s, x) => s + x.total, 0) || 18420;
  const items = todaySales.reduce((s, x) => s + x.items.reduce((a, i) => a + i.qty, 0), 0) || 64;

  return (
    <>
      <PageHeader title="Good morning, today's floor" description="A quick view of your shift performance." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Sales today"   value={currency(total)} delta="+9% vs avg" trend="up" icon={IndianRupee} />
        <StatCard label="Transactions"  value={todaySales.length || 14} icon={ShoppingCart} accent="amber" />
        <StatCard label="Items sold"    value={items} icon={ShoppingBag} accent="sage" />
        <StatCard label="Pending counts" value={3} delta="3 categories left" icon={Boxes} accent="destructive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <ChartCard title="Today's sales" description="Hourly volume" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={SALES_BY_HOUR}>
              <defs>
                <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="sales" stroke="var(--chart-2)" fill="url(#gs)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card className="rounded-xl p-5">
          <h3 className="font-semibold mb-4">Quick actions</h3>
          <div className="grid grid-cols-1 gap-2">
            <a href="/app/sales" className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition">
              <span className="text-sm font-medium flex items-center gap-2"><ShoppingCart className="h-4 w-4" />New sale</span>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </a>
            <a href="/app/wastage" className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition">
              <span className="text-sm font-medium flex items-center gap-2"><Trash2 className="h-4 w-4" />Record wastage</span>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </a>
            <a href="/app/stock" className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition">
              <span className="text-sm font-medium flex items-center gap-2"><Boxes className="h-4 w-4" />Update stock</span>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </a>
          </div>
        </Card>
      </div>

      <Card className="rounded-xl p-5 mt-4">
        <h3 className="font-semibold mb-4">Recent activity</h3>
        <div className="space-y-2">
          {SALES.slice(0, 5).map((s) => (
            <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <div className="text-sm font-medium">Sale #{s.id.toUpperCase()}</div>
                <div className="text-xs text-muted-foreground">{s.date} · {s.items.length} items</div>
              </div>
              <div className="text-sm font-semibold">{currency(s.total)}</div>
            </div>
          ))}
        </div>
      </Card>
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
