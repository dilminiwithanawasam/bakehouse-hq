import { createFileRoute } from "@tanstack/react-router";
import { ProductsManagementPage } from "@/pages/Products/Products";

export const Route = createFileRoute("/app/products")({
  component: ProductsManagementPage,
});
