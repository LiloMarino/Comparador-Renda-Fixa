import { addMonths, formatISO, isBefore, isEqual } from "date-fns";
import type { AssetWithId } from "@/features/comparator/schemas/asset-schema";
import { computeAssetValueAt } from "@/features/comparator/lib/calculations";
import { pickColor } from "./chart-config";

export type ChartMode = "gross" | "net";

export type ChartPoint = { date: string } & Record<string, number | string>;

export type ChartSeries = {
  id: string;
  name: string;
  colorVar: string;
};

export type ChartData = {
  points: ChartPoint[];
  series: ChartSeries[];
  intervalStart: Date | null;
  intervalEnd: Date | null;
};

type TransformInput = {
  assets: AssetWithId[];
  cdi: number;
  mode: ChartMode;
};

export function toChartData({ assets, cdi, mode }: TransformInput): ChartData {
  if (assets.length === 0) {
    return { points: [], series: [], intervalStart: null, intervalEnd: null };
  }

  const interval = getCommonInterval(assets);
  const series = buildSeries(assets);

  if (!interval) {
    return { points: [], series, intervalStart: null, intervalEnd: null };
  }

  const steps = monthlySteps(interval.start, interval.end);
  const points = steps.map((date) => {
    const point: ChartPoint = { date: formatISO(date, { representation: "date" }) };
    for (const asset of assets) {
      point[asset.id] = computeAssetValueAt(asset, cdi, date, mode);
    }
    return point;
  });

  return {
    points,
    series,
    intervalStart: interval.start,
    intervalEnd: interval.end,
  };
}

function buildSeries(assets: AssetWithId[]): ChartSeries[] {
  return assets.map((asset, i) => ({
    id: asset.id,
    name: asset.name,
    colorVar: pickColor(i),
  }));
}

function getCommonInterval(
  assets: AssetWithId[],
): { start: Date; end: Date } | null {
  const start = new Date(
    Math.max(...assets.map((a) => a.applicationDate.getTime())),
  );
  const end = new Date(
    Math.min(...assets.map((a) => a.redemptionDate.getTime())),
  );
  if (!isBefore(start, end)) return null;
  return { start, end };
}

function monthlySteps(start: Date, end: Date): Date[] {
  const steps: Date[] = [start];
  let cursor = addMonths(start, 1);
  while (isBefore(cursor, end)) {
    steps.push(cursor);
    cursor = addMonths(cursor, 1);
  }
  if (!isEqual(steps[steps.length - 1], end)) steps.push(end);
  return steps;
}
