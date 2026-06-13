import { createFileRoute } from "@tanstack/react-router";
import { StockPage } from "@/pages/Stock/Stock";

export const Route = createFileRoute("/app/stock")({ component: StockPage });
