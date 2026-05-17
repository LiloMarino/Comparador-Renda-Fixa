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
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { useAssetsStore } from "@/features/comparator/hooks/use-assets-store";
import { useCdi } from "@/hooks/use-settings-store";
import { formatChartCurrency, formatTickDate } from "./chart-config";
import { CustomTooltip } from "./chart-tooltip";
import { EmptyState } from "./empty-state";
import { MetricToggle } from "./metric-toggle";
import { SeriesFilter } from "./series-filter";
import { toChartData, type ChartMode, type Metric } from "./transform";
import { ValueModeToggle } from "./value-mode-toggle";

export function EvolutionChart() {
  const assets = useAssetsStore((s) => s.assets);
  const cdi = useCdi();
  const [mode, setMode] = useState<ChartMode>("net");
  const [metric, setMetric] = useState<Metric>("amount");
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());

  const data = useMemo(
    () => toChartData({ assets, cdi, mode, metric }),
    [assets, cdi, mode, metric],
  );

  const yDomain = useMemo<[number, number]>(() => {
    const visibleIds = data.series
      .map((s) => s.id)
      .filter((id) => !hidden.has(id));
    if (visibleIds.length === 0 || data.points.length === 0) return [0, 1];
    let min = Infinity;
    let max = -Infinity;
    for (const p of data.points) {
      for (const id of visibleIds) {
        const v = p[id];
        if (typeof v === "number") {
          if (v < min) min = v;
          if (v > max) max = v;
        }
      }
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
    const span = max - min;
    const pad = span > 0 ? span * 0.1 : Math.abs(max) * 0.01 || 1;
    return [min - pad, max + pad];
  }, [data, hidden]);

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
        <CardAction className="flex flex-wrap items-center gap-2">
          <MetricToggle value={metric} onChange={setMetric} />
          <ValueModeToggle value={mode} onChange={setMode} />
        </CardAction>
      </CardHeader>
      <CardContent>
        {data.intervalStart === null ? (
          <EmptyState message="Não há intervalo de tempo comum entre os ativos. Ajuste as datas de aplicação ou resgate para comparar." />
        ) : (
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="min-w-0 flex-1">
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
                    domain={yDomain}
                    allowDataOverflow={false}
                  />
                  <ChartTooltip cursor content={<CustomTooltip />} />
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
            </div>
            <SeriesFilter
              series={data.series}
              hidden={hidden}
              onToggle={toggleSeries}
              className="md:w-44 md:shrink-0"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
