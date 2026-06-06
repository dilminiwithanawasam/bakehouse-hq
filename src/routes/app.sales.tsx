/**
 * Keyboard-Optimized Cashier Sales Entry Terminal & Audit Ledger Center
 * DESIGN: Fulfills full sales transactional CRUD capabilities (POS Creation + Ledger Reading + Compliance Voiding).
 * file: src/routes/app.sales.tsx
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2, ShoppingCart, Loader2, ListOrdered, Receipt, Ban, Eye } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { currency } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-backend";

// Connect to optimized frontend service layers
import { 
  listProducts, 
  listBatches, 
  createSale, 
  listSales, 
  type Product, 
  type ProductBatch, 
  type Sale 
} from "@/lib/api-backend";

export const Route = createFileRoute("/app/sales")({ component: SalesPage });

interface LineItem {
  id: string;
  productId: string;
  productName: string;
  batchId: string;
  batchNumber: string;
  qty: number;
  unitPrice: number;
}

const lineSchema = z.object({
  productId: z.string().min(1),
  batchId: z.string().min(1),
  qty: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
});

function SalesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  
  // 🌟 CRUD NAVIGATION: Controls active mode tabs ('checkout' for create, 'ledger' for audit read/update loops)
  const [salesTab, setSalesTab] = useState<"checkout" | "ledger">("checkout");
  const [selectedHistoricalInvoice, setSelectedHistoricalInvoice] = useState<Sale | null>(null);

  // --- POS CHECKOUT CONTEXT MEMORY FIELDS ---
  const [items, setItems] = useState<LineItem[]>([]);
  const [productId, setProductId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [qty, setQty] = useState(1);

  // --- QUERY ADAPTER PIPELINES ---
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: () => listProducts(),
  });

  const product = products.find((p) => String(p.id) === productId);

  const { data: allBatches = [], isLoading: batchesLoading } = useQuery<ProductBatch[], Error>({
    queryKey: ["batches", productId],
    queryFn: () => listBatches({ product: productId }),
    enabled: Boolean(productId),
  });

  const { data: historicalSales = [], isLoading: salesLedgerLoading } = useQuery<Sale[], Error>({
    queryKey: ["sales"],
    queryFn: () => listSales(),
  });

  const batches = productId
    ? allBatches.filter((batch) => String(batch.product) === productId && batch.is_active && batch.current_quantity > 0)
    : [];

  const grandTotal = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const tax = Math.round(grandTotal * 0.05);

  // --- POS CART COMPOSITION LOGIC ---
  const handleAddLineItemToCart = () => {
    const currentBatch = batches.find((b) => String(b.id) === batchId);
    const validation = lineSchema.safeParse({
      productId, batchId, qty, unitPrice: Number(product?.price ?? 0)
    });

    if (!validation.success || !product || !currentBatch) {
      toast.error("Please pick a valid combination of product, batch, and quantity count elements.");
      return;
    }

    if (qty > currentBatch.current_quantity) {
      toast.error(`Stock limit validation failed. Selected batch only contains ${currentBatch.current_quantity} available units.`);
      return;
    }

    const duplicateIndex = items.findIndex((i) => i.productId === productId && i.batchId === batchId);

    if (duplicateIndex > -1) {
      const revisedItems = [...items];
      const combinedVolume = revisedItems[duplicateIndex].qty + qty;

      if (combinedVolume > currentBatch.current_quantity) {
        toast.error(`Checkout limits blocked. Combined cart total of ${combinedVolume} exceeds batch availability of ${currentBatch.current_quantity}.`);
        return;
      }

      revisedItems[duplicateIndex].qty = combinedVolume;
      setItems(revisedItems);
      toast.success("Updated staging cart quantity variables.");
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          productId,
          productName: product.name,
          batchId,
          batchNumber: currentBatch.batch_number,
          qty,
          unitPrice: product.price,
        }
      ]);
      toast.success(`${product.name} added to transaction draft grid.`);
    }

    setProductId("");
    setBatchId("");
    setQty(1);
  };

  const handleRemoveItemFromCart = (id: string) => setItems((p) => p.filter((item) => item.id !== id));

  // --- MUTATION COMMIT ADAPTERS: C - CREATE SALE TRANSACTION ---
  const saveSaleMutation = useMutation({
    mutationFn: async () => {
      if (items.length === 0) throw new Error("Staging checkout area grid currently contains zero items.");
      return createSale({
        date: new Date().toISOString().slice(0, 10),
        items: items,
        payment_method: "cash",
        tax_amount: tax,
        discount_amount: 0,
      });
    },
    onSuccess: () => {
      toast.success("Retail sales transaction authorized and committed to backend databases!");
      setItems([]);
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["batches-all"] });
    },
    onError: (e: Error) => {
      toast.error(e.message || "Failed to commit sale data schemas.");
    },
  });

  // --- MUTATION COMMIT ADAPTERS: U/D - VOID SALE TRANSACTION ---
  const voidSaleMutation = useMutation({
    mutationFn: async (saleId: string) => {
      const response = await apiClient.post(`/sales/${saleId}/void/`, { reason: "POS Cashier Rectification Audit" });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Sales Invoice declared Void. Ledger synchronized and storage units restored!");
      setSelectedHistoricalInvoice(null);
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["batches-all"] });
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.error?.message || "Audit invalidation transaction rejected.";
      toast.error(errMsg);
    }
  });

  return (
    <>
      <PageHeader
        title="Sales entry checkpoint"
        description="Process active frontend client transactions or perform auditing and compliance evaluations inside previous invoices."
      />

      {/* Tab Select Configuration Row */}
      <div className="flex space-x-2 mb-6 border-b border-slate-200 pb-px">
        <Button
          variant={salesTab === "checkout" ? "default" : "ghost"}
          onClick={() => setSalesTab("checkout")}
          className="rounded-t-lg rounded-b-none border-b-2 border-transparent px-4 font-bold"
        >
          <ShoppingCart className="h-4 w-4 mr-2" /> Live POS Cashier Desk
        </Button>
        <Button
          variant={salesTab === "ledger" ? "default" : "ghost"}
          onClick={() => { setSalesTab("ledger"); setSelectedHistoricalInvoice(null); }}
          className="rounded-t-lg rounded-b-none border-b-2 border-transparent px-4 font-bold"
        >
          <ListOrdered className="h-4 w-4 mr-2" /> Historical Invoices Ledger
        </Button>
      </div>

      {salesTab === "checkout" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
          <div className="space-y-4">
            <Card className="rounded-xl p-5 bg-white border border-slate-100 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_100px_100px_auto] gap-3 md:items-end">
                
                {/* Product Select element mapping with clean accessibility labels */}
                <div className="space-y-1.5">
                  <Label htmlFor="pos-item-picker" className="text-xs font-bold text-slate-600">Bakery Product Target</Label>
                  <select
                    id="pos-item-picker"
                    title="Select Bakery Product Line Target"
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 focus:outline-none"
                    value={productId}
                    onChange={(e) => { setProductId(e.target.value); setBatchId(""); }}
                  >
                    <option value="">-- Choose Bakery Item --</option>
                    {products.filter(p => p.id && p.is_active).map(p => (
                      <option key={p.id} value={String(p.id)}>{p.name} · {currency(p.price)}</option>
                    ))}
                  </select>
                </div>

                {/* Batch Select element mapping with clean accessibility labels */}
                <div className="space-y-1.5">
                  <Label htmlFor="pos-batch-picker" className="text-xs font-bold text-slate-600">Production Batch Link</Label>
                  <select
                    id="pos-batch-picker"
                    title="Select Production Run Batch reference number"
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 focus:outline-none"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    disabled={!productId || batchesLoading}
                  >
                    <option value="">-- Choose Batch --</option>
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>{b.batch_number} ({b.current_quantity} left)</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600">Quantity</Label>
                  <Input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500">Unit Price</Label>
                  <Input value={product ? currency(product.price) : "—"} disabled className="bg-slate-50 font-semibold" />
                </div>

                <Button onClick={handleAddLineItemToCart} className="h-10 font-bold bg-slate-950 hover:bg-slate-800 text-white">
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </div>
            </Card>

            <Card className="rounded-xl border border-slate-100 shadow-sm bg-white overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Product Profile</TableHead>
                    <TableHead className="font-bold text-slate-700">Batch Code</TableHead>
                    <TableHead className="text-right font-bold text-slate-700">Qty</TableHead>
                    <TableHead className="text-right font-bold text-slate-700">Unit Price</TableHead>
                    <TableHead className="text-right font-bold text-slate-700">Total Yield</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-sm text-slate-400 font-semibold">
                        Staging checkout viewport currently empty. Add products above to generate checkout definitions.
                      </TableCell>
                    </TableRow>
                  )}
                  {items.map((i) => (
                    <TableRow key={i.id} className="hover:bg-slate-50/20">
                      <TableCell className="font-bold text-slate-800">{i.productName}</TableCell>
                      <TableCell className="font-mono text-xs font-bold text-amber-700">{i.batchNumber}</TableCell>
                      <TableCell className="text-right font-bold text-slate-900">{i.qty}</TableCell>
                      <TableCell className="text-right text-slate-500 font-medium">{currency(i.unitPrice)}</TableCell>
                      <TableCell className="text-right font-black text-slate-900">{currency(i.qty * i.unitPrice)}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItemFromCart(i.id)} title="Remove item row from staging buffer">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          <Card className="rounded-xl p-5 h-fit border border-slate-100 shadow-sm bg-white">
            <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold">
              <ShoppingCart className="h-4 w-4" />
              <h3>Checkout Summary</h3>
            </div>
            <dl className="space-y-2 text-xs font-bold text-slate-600">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Staged Items</dt>
                <dd className="text-slate-900">{items.reduce((s, i) => s + i.qty, 0)} units</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="text-slate-900 font-black">{currency(grandTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Integrated Tax (5%)</dt>
                <dd className="text-slate-500">{currency(tax)}</dd>
              </div>
            </dl>
            <Separator className="my-4" />
            <div className="flex justify-between text-lg font-black text-slate-900 tracking-tight">
              <span>Grand Total</span>
              <span className="text-amber-600">{currency(grandTotal + tax)}</span>
            </div>
            <Button
              className="w-full mt-5 h-11 text-white font-black bg-slate-950 hover:bg-slate-800 shadow-md animate-fade-in"
              onClick={() => saveSaleMutation.mutate()}
              disabled={saveSaleMutation.isPending || items.length === 0}
            >
              {saveSaleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Save Sale Transaction"}
            </Button>
          </Card>
        </div>
      ) : (
        // 🌟 READ WORKFLOW (LEDGER LISTING): Expands to show historical logs inside a professional split screen view
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 animate-fade-in">
          
          {/* Main Invoices Read Ledger Grid layout */}
          <Card className="border-slate-100 shadow-sm bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold text-slate-700">Invoice Reference Number</TableHead>
                  <TableHead className="font-bold text-slate-700">Date Logged</TableHead>
                  <TableHead className="font-bold text-slate-700">Recorded Cashier</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">Gross Total</TableHead>
                  <TableHead className="text-center font-bold text-slate-700 w-20">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesLedgerLoading && <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400 font-medium">Extracting system records...</TableCell></TableRow>}
                {!salesLedgerLoading && historicalSales.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-slate-400 font-medium">No sales registered inside database registries.</TableCell></TableRow>}
                {historicalSales.map((sale: Sale) => (
                  <TableRow key={sale.id} className={cn("hover:bg-slate-50/40", sale.is_void && "opacity-50 bg-red-50/10 hover:bg-red-50/20", selectedHistoricalInvoice?.id === sale.id && "bg-slate-100/60")}>
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-slate-800">{sale.reference_number}</span>
                      {sale.is_void && <span className="ml-2 text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-black">Voided</span>}
                    </TableCell>
                    <TableCell className="font-semibold text-xs text-slate-600">{sale.date}</TableCell>
                    <TableCell className="font-bold text-slate-700 text-xs">{sale.cashier_name || `Staff ID #${sale.cashier}`}</TableCell>
                    <TableCell className="text-right font-black text-slate-900">{currency(Number(sale.total))}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" title="Examine complete line parameters row entries" onClick={() => setSelectedHistoricalInvoice(sale)}>
                        <Eye className="h-4 w-4 text-slate-600 hover:text-slate-950" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Deep inspection sub-drawer layout component (Fulfills granular analytical Reading workflows) */}
          <Card className="border-slate-100 shadow-sm bg-white p-5 h-fit sticky top-24">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-black tracking-tight border-b pb-3 border-slate-100">
              <Receipt className="h-5 w-5 text-slate-500" />
              <h3>Invoice Audit Inspector</h3>
            </div>

            {selectedHistoricalInvoice ? (
              <div className="space-y-4 animate-fade-in text-xs">
                <div className="bg-slate-50 border rounded-xl p-3 space-y-1.5 font-bold text-slate-600">
                  <div>🎫 <span className="text-slate-400">Ref Code:</span> <span className="font-mono text-slate-900">{selectedHistoricalInvoice.reference_number}</span></div>
                  <div>🧑‍💻 <span className="text-slate-400">Cashier Context:</span> <span className="text-slate-900">{selectedHistoricalInvoice.cashier_name}</span></div>
                  <div>📅 <span className="text-slate-400">Date Recorded:</span> <span className="text-slate-900">{selectedHistoricalInvoice.date}</span></div>
                  <div>💳 <span className="text-slate-400">Channel Method:</span> <span className="text-slate-900 uppercase">{selectedHistoricalInvoice.payment_method}</span></div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px]">Staged Line Rows</h4>
                  <div className="border rounded-xl divide-y bg-white overflow-hidden">
                    {selectedHistoricalInvoice.items?.map((item: any) => (
                      <div key={item.id} className="p-2.5 flex items-center justify-between font-bold">
                        <div>
                          <div className="text-slate-800">{item.product_name}</div>
                          <div className="text-[10px] text-amber-700 font-mono">Lot Reference: {item.batch_number || "Direct Consolidated"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-900">{item.quantity} x {currency(Number(item.unit_price))}</div>
                          <div className="text-slate-400 text-[10px]">{currency(Number(item.line_total))}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 font-black text-slate-800 flex justify-between text-base border-t border-dashed">
                  <span>Invoice Grand Total</span>
                  <span className={cn("text-amber-600", selectedHistoricalInvoice.is_void && "line-through text-red-400")}>
                    {currency(Number(selectedHistoricalInvoice.total))}
                  </span>
                </div>

                {/* 🌟 DELETE/UPDATE COMPLIANCE HOOK: Reverses stock quantities and nullifies billing rows */}
                {!selectedHistoricalInvoice.is_void && (user?.role === "admin" || user?.role === "manager") && (
                  <Button
                    variant="destructive"
                    className="w-full font-black h-11 shadow-sm mt-2 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white border-0"
                    onClick={() => {
                      if (confirm("Execute compliance void? This will reverse the item stock count adjustments inside your database rows.")) {
                        voidSaleMutation.mutate(selectedHistoricalInvoice.id);
                      }
                    }}
                    disabled={voidSaleMutation.isPending}
                  >
                    {voidSaleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Ban className="h-4 w-4 mr-1.5" />}
                    Void Sale Transaction
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 font-semibold leading-relaxed text-sm">
                Select an invoice item out of the ledger panel matrix grid view to audit its structural data objects.
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}