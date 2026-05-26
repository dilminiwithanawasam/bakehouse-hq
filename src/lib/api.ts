// Mock API service layer. Mirrors the shape of an axios client so it can be
// swapped for a real Django REST backend without touching call sites.
import {
  SALES, WASTAGES, PRODUCTS, type Sale, type Wastage, type Product,
} from "./mock-data";

const delay = <T,>(value: T, ms = 250): Promise<T> =>
  new Promise((r) => setTimeout(() => r(value), ms));

// In-memory stores (mutable copies)
let sales: Sale[] = [...SALES];
let wastages: Wastage[] = [...WASTAGES];
let products: Product[] = PRODUCTS.map(p => ({ ...p }));

export const api = {
  // Sales
  listSales:  () => delay(sales.slice().reverse()),
  createSale: (s: Omit<Sale, "id">) => {
    const created: Sale = { ...s, id: `s${Date.now()}` };
    sales = [created, ...sales];
    return delay(created);
  },

  // Wastage
  listWastage:  () => delay(wastages.slice().reverse()),
  createWastage: (w: Omit<Wastage, "id">) => {
    const created: Wastage = { ...w, id: `w${Date.now()}` };
    wastages = [created, ...wastages];
    return delay(created);
  },

  // Stock
  listProducts: () => delay(products.slice()),
  updateStock:  (id: string, newStock: number) => {
    products = products.map(p => p.id === id ? { ...p, stock: newStock } : p);
    return delay(products.find(p => p.id === id)!);
  },
};

export type ApiError = { message: string };
