import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Metric } from "./transform";

type MetricToggleProps = {
  value: Metric;
  onChange: (metric: Metric) => void;
};

export function MetricToggle({ value, onChange }: MetricToggleProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as Metric)}>
      <TabsList>
        <TabsTrigger value="amount">Montante</TabsTrigger>
        <TabsTrigger value="yield">Rendimento</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
