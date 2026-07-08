import { createFileRoute } from "@tanstack/react-router";
import { ProductsManagementPage } from "@/pages/Products/Products";
import { ProtectedRoute } from "@/components/common/protected-route";
import { PERMISSIONS } from "@/lib/permissions";

export const Route = createFileRoute("/app/products")({
  component: () => (
    <ProtectedRoute permissions={[PERMISSIONS.PRODUCT_VIEW]}>
      <ProductsManagementPage />
    </ProtectedRoute>
  ),
});
