/**
 * Product and Batch Inventory Management CRUD Center
 * Fixed: Imports named API functions directly from api-backend to prevent runtime freezes.
 * file: src/routes/app.products.tsx
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Layers, Package, Loader2, Calendar } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// 🌟 THE FIX: Import the exact named functions straight from your api-backend file
import { 
  listProducts, 
  listBatches, 
  createProduct, 
  createBatch, 
  type Product, 
  type ProductBatch 
} from "@/lib/api-backend";

export const Route = createFileRoute("/app/products")({
  component: ProductsManagementPage,
});

function ProductsManagementPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"products" | "batches">("products");

  // --- DATA FETCHING QUERIES ---
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: () => listProducts(), // Called directly
  });

  const { data: batches = [], isLoading: batchesLoading } = useQuery<ProductBatch[], Error>({
    queryKey: ["batches-all"],
    queryFn: () => listBatches(), // Called directly
  });

  // --- FORM STATES: MASTER PRODUCT ---
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [shelfLife, setShelfLife] = useState("3");

  // --- FORM STATES: PRODUCTION BATCH ---
  const [selectedProdId, setSelectedProdId] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [qtyProduced, setQtyProduced] = useState("");
  const [prodDate, setProdDate] = useState(new Date().toISOString().slice(0, 10));

  // --- ACTIONS: SAVE NEW PRODUCT DEFINITION ---
  const addProductMutation = useMutation({
    mutationFn: async () => {
      if (!prodName || !prodPrice) throw new Error("Please enter a valid product name and retail price.");
      
      const payload = {
        name: prodName,
        price: Number(prodPrice),
        category: 1, // Connects to default menu category fallback
        shelf_life_days: Number(shelfLife),
        stock: 0,
        min_stock: 10,
        is_active: true,
      };
      
      console.log("Transmitting product payloads down to Django viewsets:", payload);
      return createProduct(payload); // Called directly
    },
    onSuccess: () => {
      toast.success("New master product specification saved!");
      setProdName("");
      setProdPrice("");
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: Error) => {
      console.error("Product creation failed:", err);
      toast.error(err.message || "Failed to record product specification.");
    },
  });

  // --- ACTIONS: PUBLISH DAILY BAKING BATCH ---
  const addBatchMutation = useMutation({
    mutationFn: async () => {
      console.log("Validating batch form attributes...", { selectedProdId, batchNumber, qtyProduced });
      
      if (!selectedProdId || !batchNumber || !qtyProduced) {
        throw new Error("Validation failed: Ensure a product variant is selected, a batch number is entered, and quantities are set.");
      }
      
      const payload = {
        product: Number(selectedProdId),
        batch_number: batchNumber,
        production_date: prodDate,
        quantity_produced: Number(qtyProduced),
        current_quantity: Number(qtyProduced),
        is_active: true,
      };
      
      console.log("Triggering active API network pipeline request call with payload:", payload);
      return createBatch(payload); // 🌟 Called directly - guarantees execution
    },
    onSuccess: () => {
      toast.success("Baking run recorded! Batch inventory is now live in PostgreSQL.");
      setBatchNumber("");
      setQtyProduced("");
      // Force refreshing view grids instantly across layout screens
      qc.invalidateQueries({ queryKey: ["batches-all"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: Error) => {
      console.error("Batch tracking API transaction error context:", err);
      toast.error(err.message || "Failed to publish production batch run.");
    },
  });

  return (
    <>
      <PageHeader 
        title="Inventory management" 
        description="Configure baseline bakery item profiles and log active batch baking operations." 
      />

      {/* Primary Navigation Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-slate-200 pb-px">
        <Button
          variant={activeTab === "products" ? "default" : "ghost"}
          onClick={() => setActiveTab("products")}
          className="rounded-t-lg rounded-b-none border-b-2 border-transparent px-4 font-semibold"
        >
          <Package className="h-4 w-4 mr-2" /> Master Products Catalog
        </Button>
        <Button
          variant={activeTab === "batches" ? "default" : "ghost"}
          onClick={() => setActiveTab("batches")}
          className="rounded-t-lg rounded-b-none border-b-2 border-transparent px-4 font-semibold"
        >
          <Layers className="h-4 w-4 mr-2" /> Daily Baking Batches
        </Button>
      </div>

      {activeTab === "products" ? (
        <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
          {/* Master Item Configuration Panel */}
          <Card className="p-5 border-slate-100 shadow-sm bg-white h-fit">
            <h3 className="font-bold text-base text-slate-800 mb-4 flex items-center">
              <Plus className="h-4 w-4 mr-1 text-amber-600" /> Add Product Variant
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Product Name</Label>
                <Input 
                  placeholder="e.g., Fudge Cake, White Bread" 
                  value={prodName} 
                  onChange={(e) => setProdName(e.target.value)} 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Retail Selling Price (LKR)</Label>
                <Input 
                  type="number" 
                  placeholder="750.00" 
                  value={prodPrice} 
                  onChange={(e) => setProdPrice(e.target.value)} 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Shelf Life Constant (Days)</Label>
                <Input 
                  type="number" 
                  value={shelfLife} 
                  onChange={(e) => setShelfLife(e.target.value)} 
                />
              </div>
              <Button 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold mt-2"
                onClick={() => addProductMutation.mutate()}
                disabled={addProductMutation.isPending}
              >
                {addProductMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Product Profile"}
              </Button>
            </div>
          </Card>

          {/* Database Catalog Matrix Tables Display */}
          <Card className="border-slate-100 shadow-sm bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold text-slate-700">Product Specification Name</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">Selling Price</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">Accumulated Live Stock</TableHead>
                  <TableHead className="font-bold text-slate-700">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsLoading && (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-400">Querying product rows...</TableCell></TableRow>
                )}
                {!productsLoading && products.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-400">No active products populated yet.</TableCell></TableRow>
                )}
                {products.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-bold text-slate-800">{p.name}</TableCell>
                    <TableCell className="text-right font-medium text-slate-600">Rs. {p.price}</TableCell>
                    <TableCell className="text-right font-bold text-amber-700">{p.stock} units</TableCell>
                    <TableCell>
                      <span className="text-xs font-bold bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full">Active</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
          {/* Baking Run Intake Registry Sheet Form */}
          <Card className="p-5 border-slate-100 shadow-sm bg-white h-fit">
            <h3 className="font-bold text-base text-slate-800 mb-4 flex items-center">
              <Plus className="h-4 w-4 mr-1 text-amber-600" /> Log Baking Run
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Select Target Product Variant</Label>
                <Select value={selectedProdId} onValueChange={setSelectedProdId}>
                  <SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue placeholder="Choose product..." /></SelectTrigger>
                  <SelectContent>
                    {products.map((p: any) => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Batch Control Identifier Code</Label>
                <Input 
                  placeholder="e.g., BATCH-2026-X" 
                  value={batchNumber} 
                  onChange={(e) => setBatchNumber(e.target.value)} 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Quantity Baked</Label>
                <Input 
                  type="number" 
                  placeholder="60" 
                  value={qtyProduced} 
                  onChange={(e) => setQtyProduced(e.target.value)} 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Manufacturing Production Date</Label>
                <Input 
                  type="date" 
                  value={prodDate} 
                  onChange={(e) => setProdDate(e.target.value)} 
                />
              </div>
              <Button 
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold mt-2 shadow-sm transition-all"
                onClick={() => addBatchMutation.mutate()}
                disabled={addBatchMutation.isPending}
              >
                {addBatchMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Active Batch"}
              </Button>
            </div>
          </Card>

          {/* Active Production Runs Registry Monitoring Dashboard table */}
          <Card className="border-slate-100 shadow-sm bg-white overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold text-slate-700">Batch Code Reference</TableHead>
                  <TableHead className="font-bold text-slate-700">Bakery Product Item</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">Current Quantity</TableHead>
                  <TableHead className="font-bold text-slate-700 flex items-center"><Calendar className="h-3 w-3 mr-1" /> Expiry Timeline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batchesLoading && (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-400">Gathering batch metrics...</TableCell></TableRow>
                )}
                {!batchesLoading && batches.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-400">No batch entries found in database systems. Build one above!</TableCell></TableRow>
                )}
                {batches.map((b: any) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded px-2 py-0.5">
                        {b.batch_number}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold text-slate-800">{b.product_name || `Product Variant #${b.product}`}</TableCell>
                    <TableCell className="text-right font-bold text-slate-700">{b.current_quantity} / {b.quantity_produced} items</TableCell>
                    <TableCell className="font-semibold text-red-600 bg-red-50/60 border border-red-100 rounded px-2 w-fit">{b.expiry_date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </>
  );
}