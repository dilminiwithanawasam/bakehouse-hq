import type { Role } from "@/services/mockData";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  manager: "Manager",
  salesperson: "Salesperson",
  factory_distributor: "Factory Distributor",
  customer: "Customer",
};

export const ROLE_OPTIONS: Role[] = [
  "admin",
  "manager",
  "salesperson",
  "factory_distributor",
  "customer",
];
