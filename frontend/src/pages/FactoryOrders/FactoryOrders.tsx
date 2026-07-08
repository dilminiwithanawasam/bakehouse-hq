import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Package, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/services/api";

interface FactoryOrderRow {
  id: string;
  reference_number: string;
  customer_name: string;
  customer_email?: string;
  pickup_date?: string;
  status: string;
  total: number;
  notes?: string;
  created_at?: string;
}

export function FactoryOrdersPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [query, setQuery] = useState("");
  const [date, setDate] = useState(today);
  const [status, setStatus] = useState("all");

  const { data: orders = [] } = useQuery<FactoryOrderRow[]>({
    queryKey: ["factory-orders", date, status],
    queryFn: () => api.listOrders({ status: status === "all" ? undefined : status }),
  });

  const filteredOrders = useMemo(() => {
    const term = query.toLowerCase();
    return orders.filter((order) => {
      const matchesDate = !date || (order.pickup_date || order.created_at || "").includes(date);
      const matchesQuery =
        !term ||
        order.reference_number.toLowerCase().includes(term) ||
        order.customer_name.toLowerCase().includes(term) ||
        (order.notes || "").toLowerCase().includes(term);
      return matchesDate && matchesQuery;
    });
  }, [orders, query, date]);

  return (
    <>
      <PageHeader
        title="Factory distributor orders"
        description="Review outlet orders generated from salesperson sales for the current day."
      />

      <Card className="p-4 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1 space-y-1.5">
            <label className="text-sm font-semibold">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Reference, customer, notes"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">Date</label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold" htmlFor="factory-order-status">
              Status
            </label>
            <select
              id="factory-order-status"
              title="Filter orders by status"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="packed">Packed</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Pickup</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="font-semibold">{order.reference_number}</div>
                  <div className="text-xs text-muted-foreground">{order.notes || "No notes"}</div>
                </TableCell>
                <TableCell>{order.customer_name}</TableCell>
                <TableCell>{order.pickup_date || "—"}</TableCell>
                <TableCell>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold uppercase">
                    {order.status}
                  </span>
                </TableCell>
                <TableCell className="text-right font-semibold">Rs. {Number(order.total).toFixed(2)}</TableCell>
              </TableRow>
            ))}
            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No orders match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
