import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ChartMode } from "./transform";

type ValueModeToggleProps = {
  value: ChartMode;
  onChange: (mode: ChartMode) => void;
};

export function ValueModeToggle({ value, onChange }: ValueModeToggleProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as ChartMode)}>
      <TabsList>
        <TabsTrigger value="net">Líquido</TabsTrigger>
        <TabsTrigger value="gross">Bruto</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
