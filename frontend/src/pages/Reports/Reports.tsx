import { useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Download } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { ChartCard } from "@/pages/Dashboard/components/chart-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { api } from "@/services/api";
import { currency } from "@/services/mockData";

export function ReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [product, setProduct] = useState("all");
  const [cat, setCat] = useState("all");
  const reportRef = useRef<HTMLDivElement>(null);

  const reportFilters = useMemo(
    () => ({
      start_date: from || undefined,
      end_date: to || undefined,
      product: product === "all" ? undefined : product,
      category: cat === "all" ? undefined : cat,
    }),
    [from, to, product, cat],
  );

  const { data: dashboard } = useQuery({
    queryKey: ["reports", "dashboard", from, to, product, cat],
    queryFn: () => api.getDashboardData(reportFilters),
  });
  const { data: salesReport } = useQuery({
    queryKey: ["reports", "sales", from, to, product, cat],
    queryFn: () => api.getSalesReport(reportFilters.start_date, reportFilters.end_date, { product: reportFilters.product, category: reportFilters.category }),
  });
  const { data: wastageReport } = useQuery({
    queryKey: ["reports", "wastage", from, to, product, cat],
    queryFn: () => api.getWastageReport(reportFilters.start_date, reportFilters.end_date, { product: reportFilters.product, category: reportFilters.category }),
  });
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.listProducts(),
  });
  const { data: recentSales = [] } = useQuery({
    queryKey: ["sales", "recent", from, to, product, cat],
    queryFn: () => api.listSales(reportFilters),
  });

  const categories = useMemo(() => {
    const options = new Map<string, string>();
    products.forEach((p: any) => {
      const value = p.category ?? p.category_id ?? p.categoryId;
      const label = p.category_name || p.categoryName || p.category || "Uncategorized";
      if (value !== undefined && value !== null && !options.has(String(value))) {
        options.set(String(value), String(label));
      }
    });
    return Array.from(options.entries()).map(([value, label]) => ({ value, label }));
  }, [products]);

  const topProducts = (dashboard?.top_products || []).map((p: any) => ({
    id: p.product__id || p.product_id || p.id,
    name: p.product__name || p.product_name || p.name,
    sold: p.total_qty || p.total_revenue || 0,
  }));

  const wastageByProduct: Record<string, number> = {};
  (wastageReport?.by_product || []).forEach((w: any) => {
    const id = w.product__id || w.product_id || w.id;
    wastageByProduct[id] = w.total_qty || w.total_loss || 0;
  });

  const productRanking = topProducts
    .map((p: any) => ({ name: p.name, sold: p.sold, wasted: wastageByProduct[p.id] || 0 }))
    .slice(0, 8);

  const summaryStats = useMemo(() => {
    const revenue = (salesReport?.by_date || []).reduce((sum: number, item: any) => sum + Number(item.total_revenue || 0), 0);
    const transactions = (salesReport?.by_date || []).reduce((sum: number, item: any) => sum + Number(item.transaction_count || 0), 0);
    const wastageLoss = (wastageReport?.trend || []).reduce((sum: number, item: any) => sum + Number(item.total_loss || 0), 0);
    const topProduct = topProducts[0];

    return {
      revenue,
      transactions,
      wastageLoss,
      topProduct: topProduct?.name || "No sales yet",
    };
  }, [salesReport, wastageReport, topProducts]);

  const exportPdf = async () => {
    try {
      if (!reportRef.current) {
        throw new Error("Report content unavailable");
      }

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let remainingHeight = imgHeight;
      let position = 20;

      pdf.addImage(imgData, "PNG", 20, position, imgWidth, imgHeight);
      remainingHeight -= pageHeight - 40;

      while (remainingHeight > 0) {
        pdf.addPage();
        position = 20 - (pageHeight - 40) * (1 + Math.floor((imgHeight - remainingHeight) / (pageHeight - 40)));
        pdf.addImage(imgData, "PNG", 20, position, imgWidth, imgHeight);
        remainingHeight -= pageHeight - 40;
      }

      pdf.save(`sales-report-${from || "all"}-${to || "all"}.pdf`);
      toast.success("PDF download ready");
    } catch (e: any) {
      toast.error(e?.message || "Failed to prepare PDF");
    }
  };

  return (
    <>
      <PageHeader
        title="Reports & analytics"
        description="Cross-cut your operations with date, product and category filters."
        actions={
          <>
            <Button size="sm" onClick={exportPdf}>
              <Download className="h-4 w-4 mr-2" />
              Generate Report PDF
            </Button>
          </>
        }
      />

      <Card className="rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">From</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Product</Label>
            <Select value={product} onValueChange={setProduct}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All products</SelectItem>
                {products.map((p: any) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Category</Label>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div ref={reportRef} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
          <Card className="rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Revenue</p>
            <p className="text-2xl font-semibold">{currency(summaryStats.revenue)}</p>
          </Card>
          <Card className="rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Transactions</p>
            <p className="text-2xl font-semibold">{summaryStats.transactions}</p>
          </Card>
          <Card className="rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Wastage loss</p>
            <p className="text-2xl font-semibold">{currency(summaryStats.wastageLoss)}</p>
          </Card>
          <Card className="rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Top product</p>
            <p className="text-2xl font-semibold">{summaryStats.topProduct}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <ChartCard title="Revenue trend" description="Last 14 days">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={(salesReport?.by_date || []).map((d: any) => ({
                date: d.date,
                revenue: d.total_revenue || d.total || 0,
                orders: d.transaction_count || d.transaction_count,
              }))}
            >
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
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Product ranking" description="Sold vs wasted units">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={productRanking}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={70}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="sold" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="wasted" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        </div>

        <Card className="rounded-xl p-5 mt-4">
        <h3 className="font-semibold mb-4">Sales report preview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground border-b">
              <tr>
                <th className="py-2">Date</th>
                <th>Sale #</th>
                <th>Cashier</th>
                <th>Items</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.slice(0, 10).map((s: any) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="py-2 text-muted-foreground">{s.date}</td>
                  <td className="font-medium">#{String(s.id).toUpperCase()}</td>
                  <td>{s.cashier || s.recordedBy || "—"}</td>
                  <td>
                    {(s.items || [])
                      .map(
                        (i: any) =>
                          `${products.find((p: any) => p.id === i.product || i.productId)?.name || i.product || i.productId}×${i.quantity || i.qty}`,
                      )
                      .join(", ")}
                  </td>
                  <td className="text-right font-semibold">
                    {currency(s.total || s.grand_total || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
