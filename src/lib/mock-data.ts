export type Role = "admin" | "manager" | "salesperson";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "disabled";
  lastLogin: string;
  avatar?: string;
}

export const MOCK_USERS: User[] = [
  { id: "u1", name: "Aarav Mehta",  email: "admin@bakery.com",       role: "admin",       status: "active", lastLogin: "2026-05-26 08:12" },
  { id: "u2", name: "Priya Sharma", email: "manager@bakery.com",     role: "manager",     status: "active", lastLogin: "2026-05-26 07:48" },
  { id: "u3", name: "Rohan Patel",  email: "sales@bakery.com",       role: "salesperson", status: "active", lastLogin: "2026-05-26 06:15" },
  { id: "u4", name: "Neha Kapoor",  email: "sales2@bakery.com",      role: "salesperson", status: "active", lastLogin: "2026-05-25 19:02" },
  { id: "u5", name: "Vikram Singh", email: "manager2@bakery.com",    role: "manager",     status: "disabled", lastLogin: "2026-05-20 09:33" },
];

// Password for every demo account: "demo1234"
export const DEMO_PASSWORD = "demo1234";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
}

export const PRODUCTS: Product[] = [
  { id: "p1",  name: "Sourdough Loaf",        category: "Bread",    price: 180, stock: 24, minStock: 10 },
  { id: "p2",  name: "Croissant",             category: "Pastry",   price: 90,  stock: 38, minStock: 15 },
  { id: "p3",  name: "Chocolate Muffin",      category: "Pastry",   price: 70,  stock: 6,  minStock: 12 },
  { id: "p4",  name: "Blueberry Cheesecake",  category: "Cake",     price: 320, stock: 4,  minStock: 5 },
  { id: "p5",  name: "Garlic Baguette",       category: "Bread",    price: 140, stock: 18, minStock: 10 },
  { id: "p6",  name: "Almond Danish",         category: "Pastry",   price: 95,  stock: 22, minStock: 12 },
  { id: "p7",  name: "Tiramisu Slice",        category: "Cake",     price: 220, stock: 9,  minStock: 6 },
  { id: "p8",  name: "Whole Wheat Bun",       category: "Bread",    price: 35,  stock: 60, minStock: 25 },
  { id: "p9",  name: "Cinnamon Roll",         category: "Pastry",   price: 110, stock: 14, minStock: 10 },
  { id: "p10", name: "Red Velvet Cupcake",    category: "Cake",     price: 80,  stock: 2,  minStock: 8 },
  { id: "p11", name: "Cold Brew Coffee",      category: "Beverage", price: 150, stock: 30, minStock: 12 },
  { id: "p12", name: "Masala Chai",           category: "Beverage", price: 60,  stock: 0,  minStock: 10 },
];

export interface SaleItem { productId: string; qty: number; unitPrice: number; }
export interface Sale {
  id: string;
  date: string;
  cashier: string;
  items: SaleItem[];
  total: number;
}

const today = new Date();
const daysAgo = (n: number) => {
  const d = new Date(today); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10);
};

export const SALES: Sale[] = Array.from({ length: 28 }).map((_, i) => {
  const id = `s${i + 1}`;
  const date = daysAgo(Math.floor(i / 6));
  const pick = PRODUCTS[i % PRODUCTS.length];
  const pick2 = PRODUCTS[(i + 3) % PRODUCTS.length];
  const items: SaleItem[] = [
    { productId: pick.id, qty: 1 + (i % 4), unitPrice: pick.price },
    { productId: pick2.id, qty: 1 + (i % 3), unitPrice: pick2.price },
  ];
  const total = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  return { id, date, cashier: i % 2 ? "Rohan Patel" : "Neha Kapoor", items, total };
});

export type WastageReason = "Expired" | "Damaged" | "Returned" | "Overproduction";

export interface Wastage {
  id: string;
  date: string;
  productId: string;
  qty: number;
  reason: WastageReason;
  loss: number;
  notes?: string;
  recordedBy: string;
}

export const WASTAGES: Wastage[] = [
  { id: "w1", date: daysAgo(0), productId: "p3",  qty: 4, reason: "Expired",       loss: 280, recordedBy: "Rohan Patel" },
  { id: "w2", date: daysAgo(0), productId: "p4",  qty: 1, reason: "Damaged",       loss: 320, recordedBy: "Neha Kapoor" },
  { id: "w3", date: daysAgo(1), productId: "p10", qty: 3, reason: "Overproduction",loss: 240, recordedBy: "Rohan Patel" },
  { id: "w4", date: daysAgo(2), productId: "p2",  qty: 5, reason: "Expired",       loss: 450, recordedBy: "Neha Kapoor" },
  { id: "w5", date: daysAgo(3), productId: "p9",  qty: 2, reason: "Returned",      loss: 220, recordedBy: "Rohan Patel" },
  { id: "w6", date: daysAgo(4), productId: "p6",  qty: 3, reason: "Damaged",       loss: 285, recordedBy: "Neha Kapoor" },
  { id: "w7", date: daysAgo(5), productId: "p3",  qty: 6, reason: "Expired",       loss: 420, recordedBy: "Rohan Patel" },
];

export const SALES_BY_HOUR = [
  { hour: "8 AM",  sales: 1200 }, { hour: "9 AM",  sales: 2400 },
  { hour: "10 AM", sales: 3600 }, { hour: "11 AM", sales: 4200 },
  { hour: "12 PM", sales: 5800 }, { hour: "1 PM",  sales: 5200 },
  { hour: "2 PM",  sales: 3800 }, { hour: "3 PM",  sales: 3200 },
  { hour: "4 PM",  sales: 4100 }, { hour: "5 PM",  sales: 5500 },
  { hour: "6 PM",  sales: 6400 }, { hour: "7 PM",  sales: 7100 },
  { hour: "8 PM",  sales: 5400 },
];

export const DAILY_SALES_TREND = Array.from({ length: 14 }).map((_, i) => ({
  date: daysAgo(13 - i).slice(5),
  revenue: 18000 + Math.round(Math.sin(i / 2) * 5000 + Math.random() * 3000),
  orders: 60 + Math.round(Math.cos(i / 2) * 18 + Math.random() * 12),
}));

export const CATEGORY_BREAKDOWN = [
  { name: "Bread",    value: 32 },
  { name: "Pastry",   value: 41 },
  { name: "Cake",     value: 18 },
  { name: "Beverage", value: 9 },
];

export const productName = (id: string) => PRODUCTS.find(p => p.id === id)?.name ?? "Unknown";
export const currency = (n: number) => `₹${n.toLocaleString("en-IN")}`;
