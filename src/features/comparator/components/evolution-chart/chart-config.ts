import { format, parseISO } from "date-fns";
import { formatCurrency } from "@/lib/format";

export const CHART_COLOR_VARS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export function pickColor(index: number): string {
  return CHART_COLOR_VARS[index % CHART_COLOR_VARS.length];
}

export function formatTickDate(iso: string): string {
  return format(parseISO(iso), "MM/yy");
}

export function formatTooltipDate(iso: string): string {
  return format(parseISO(iso), "dd/MM/yyyy");
}

export function formatChartCurrency(value: number): string {
  return formatCurrency(value);
}
