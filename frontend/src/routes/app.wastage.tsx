import { createFileRoute } from "@tanstack/react-router";
import { WastagePage } from "@/pages/Wastage/Wastage";

export const Route = createFileRoute("/app/wastage")({ component: WastagePage });
