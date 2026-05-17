import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { useAssetsStore } from "@/features/comparator/hooks/use-assets-store";
import { useCdi } from "@/hooks/use-settings-store";
import { formatChartCurrency, formatTickDate } from "./chart-config";
import { CustomTooltip } from "./chart-tooltip";
import { EmptyState } from "./empty-state";
import { toChartData, type ChartMode } from "./transform";
import { ValueModeToggle } from "./value-mode-toggle";

export function EvolutionChart() {
  const assets = useAssetsStore((s) => s.assets);
  const cdi = useCdi();
  const [mode, setMode] = useState<ChartMode>("net");
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());

  const data = useMemo(
    () => toChartData({ assets, cdi, mode }),
    [assets, cdi, mode],
  );

  const config = useMemo<ChartConfig>(() => {
    const entries: ChartConfig = {};
    for (const s of data.series) {
      entries[s.id] = { label: s.name, color: s.colorVar };
    }
    return entries;
  }, [data.series]);

  if (assets.length === 0) return null;

  function toggleSeries(id: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução do montante</CardTitle>
        <CardAction>
          <ValueModeToggle value={mode} onChange={setMode} />
        </CardAction>
      </CardHeader>
      <CardContent>
        {data.intervalStart === null ? (
          <EmptyState message="Não há intervalo de tempo comum entre os ativos. Ajuste as datas de aplicação ou resgate para comparar." />
        ) : (
          <ChartContainer config={config} className="max-h-[420px] w-full">
            <LineChart data={data.points} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatTickDate}
                minTickGap={24}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatChartCurrency}
                width={90}
              />
              <ChartTooltip cursor content={<CustomTooltip />} />
              <ChartLegend
                onClick={(e) => {
                  const key = e.dataKey;
                  if (typeof key === "string") toggleSeries(key);
                }}
                content={<ChartLegendContent />}
              />
              {data.series.map((s) => (
                <Line
                  key={s.id}
                  type="monotone"
                  dataKey={s.id}
                  name={s.name}
                  stroke={`var(--color-${s.id})`}
                  strokeWidth={2}
                  dot={false}
                  hide={hidden.has(s.id)}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
