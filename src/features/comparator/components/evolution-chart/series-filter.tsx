import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { ChartSeries } from "./transform";

type SeriesFilterProps = {
  series: ChartSeries[];
  hidden: Set<string>;
  onToggle: (id: string) => void;
  className?: string;
};

export function SeriesFilter({
  series,
  hidden,
  onToggle,
  className,
}: SeriesFilterProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 md:max-h-[420px] md:overflow-y-auto md:pr-1",
        className,
      )}
      role="group"
      aria-label="Filtrar ativos no gráfico"
    >
      {series.map((s) => {
        const checked = !hidden.has(s.id);
        const id = `series-${s.id}`;
        return (
          <label
            key={s.id}
            htmlFor={id}
            className="flex cursor-pointer items-center gap-2 text-sm"
          >
            <Checkbox
              id={id}
              checked={checked}
              onCheckedChange={() => onToggle(s.id)}
              style={
                checked
                  ? { backgroundColor: s.colorVar, borderColor: s.colorVar }
                  : undefined
              }
            />
            <span className="truncate">{s.name}</span>
          </label>
        );
      })}
    </div>
  );
}
