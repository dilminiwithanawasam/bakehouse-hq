import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  FileBarChart,
  Users,
  Settings,
  Factory,
} from "lucide-react";
import type { Role } from "@/services/mockData";

export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard.view",
  PRODUCT_VIEW: "product.view",
  PRODUCT_CREATE: "product.create",
  PRODUCT_EDIT: "product.edit",
  PRODUCT_DELETE: "product.delete",
  BATCH_VIEW: "batch.view",
  BATCH_CREATE: "batch.create",
  BATCH_EDIT: "batch.edit",
  BATCH_DELETE: "batch.delete",
  SALES_CREATE: "sales.create",
  SALES_VIEW: "sales.view",
  ORDER_VIEW: "order.view",
  REPORT_VIEW: "report.view",
  USER_MANAGEMENT: "user.management",
  FACTORY_ORDER_VIEW: "factory_order.view",
  SETTINGS_VIEW: "settings.view",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ALL_PERMISSIONS: Permission[] = [
  PERMISSIONS.DASHBOARD_VIEW,
  PERMISSIONS.PRODUCT_VIEW,
  PERMISSIONS.PRODUCT_CREATE,
  PERMISSIONS.PRODUCT_EDIT,
  PERMISSIONS.PRODUCT_DELETE,
  PERMISSIONS.BATCH_VIEW,
  PERMISSIONS.BATCH_CREATE,
  PERMISSIONS.BATCH_EDIT,
  PERMISSIONS.BATCH_DELETE,
  PERMISSIONS.SALES_CREATE,
  PERMISSIONS.SALES_VIEW,
  PERMISSIONS.ORDER_VIEW,
  PERMISSIONS.REPORT_VIEW,
  PERMISSIONS.USER_MANAGEMENT,
  PERMISSIONS.FACTORY_ORDER_VIEW,
  PERMISSIONS.SETTINGS_VIEW,
];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ALL_PERMISSIONS,
  manager: ALL_PERMISSIONS,
  salesperson: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.BATCH_VIEW,
    PERMISSIONS.SALES_CREATE,
    PERMISSIONS.SALES_VIEW,
  ],
  factory_distributor: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_EDIT,
    PERMISSIONS.BATCH_VIEW,
    PERMISSIONS.BATCH_CREATE,
    PERMISSIONS.BATCH_EDIT,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.FACTORY_ORDER_VIEW,
  ],
  customer: [],
};

export interface NavItemDefinition {
  to: string;
  label: string;
  icon: LucideIcon;
  permissions: Permission[];
}

export const APP_NAV_ITEMS: NavItemDefinition[] = [
  {
    to: "/app/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    permissions: [PERMISSIONS.DASHBOARD_VIEW],
  },
  {
    to: "/app/products",
    label: "Products",
    icon: Package,
    permissions: [PERMISSIONS.PRODUCT_VIEW],
  },
  {
    to: "/app/sales",
    label: "Sales Entry",
    icon: ShoppingCart,
    permissions: [PERMISSIONS.SALES_CREATE],
  },
  {
    to: "/app/factory-orders",
    label: "Factory Orders",
    icon: Factory,
    permissions: [PERMISSIONS.FACTORY_ORDER_VIEW],
  },
  {
    to: "/app/stock",
    label: "Stock Counting",
    icon: Boxes,
    permissions: [PERMISSIONS.BATCH_VIEW],
  },
  {
    to: "/app/reports",
    label: "Reports",
    icon: FileBarChart,
    permissions: [PERMISSIONS.REPORT_VIEW],
  },
  {
    to: "/app/users",
    label: "User Management",
    icon: Users,
    permissions: [PERMISSIONS.USER_MANAGEMENT],
  },
  {
    to: "/app/settings",
    label: "Settings",
    icon: Settings,
    permissions: [PERMISSIONS.SETTINGS_VIEW],
  },
];

export function getRolePermissions(role?: Role | null): Permission[] {
  if (!role) return [];
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return getRolePermissions(role).includes(permission);
}

export function hasAllPermissions(role: Role | null | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  const rolePermissions = getRolePermissions(role);
  return permissions.every((permission) => rolePermissions.includes(permission));
}

export function hasAnyPermission(role: Role | null | undefined, permissions: Permission[]): boolean {
  if (!role || permissions.length === 0) return false;
  const rolePermissions = getRolePermissions(role);
  return permissions.some((permission) => rolePermissions.includes(permission));
}

export function canAccess(role: Role | null | undefined, permissions: Permission[]): boolean {
  return hasAllPermissions(role, permissions);
}
