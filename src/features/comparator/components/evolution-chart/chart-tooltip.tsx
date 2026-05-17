import { ChartTooltipContent } from "@/components/ui/chart";
import { formatChartCurrency, formatTooltipDate } from "./chart-config";

export function CustomTooltip(
  props: React.ComponentProps<typeof ChartTooltipContent>,
) {
  return (
    <ChartTooltipContent
      {...props}
      labelFormatter={(value) =>
        typeof value === "string" ? formatTooltipDate(value) : String(value)
      }
      formatter={(value, name, item) => (
        <div className="flex w-full items-center gap-2">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-xs"
            style={{ backgroundColor: item.color }}
          />
          <div className="flex flex-1 items-center justify-between gap-3">
            <span className="text-muted-foreground">{name}</span>
            <span className="font-mono font-medium tabular-nums">
              {typeof value === "number"
                ? formatChartCurrency(value)
                : String(value)}
            </span>
          </div>
        </div>
      )}
      indicator="dot"
    />
  );
}
