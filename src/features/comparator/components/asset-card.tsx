import { Pencil, Trash2 } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCdi } from "@/hooks/use-settings-store";
import {
  INVESTMENT_TYPE_LABELS,
  YIELD_TYPE_LABELS,
  isTaxExempt,
  type AssetWithId,
} from "@/features/comparator/schemas/asset-schema";
import { computeAsset } from "@/features/comparator/lib/calculations";
import { formatDate, formatDateWithDays, formatPercent, formatPercentNumber, formatCurrency } from "@/lib/format";

const INVESTMENT_TYPE_BADGE_CLASS: Record<string, string> = {
  CDB: "text-sm h-6 border-transparent bg-blue-600 text-white hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-500",
  LCI: "text-sm h-6 border-transparent bg-orange-600 text-white hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-500",
  LCA: "text-sm h-6 border-transparent bg-emerald-600 text-white hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-500",
};

const YIELD_TYPE_BADGE_CLASS: Record<string, string> = {
  pre: "border-transparent text-sm text-violet-700 bg-violet-50 dark:border-violet-500 dark:text-violet-300 dark:bg-violet-500/10",
  pos: "border-transparent text-sm text-sky-700 bg-sky-50 dark:border-sky-500 dark:text-sky-300 dark:bg-sky-500/10",
};

type AssetCardProps = {
  asset: AssetWithId;
  onEdit: (asset: AssetWithId) => void;
  onDelete: (id: string) => void;
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export function AssetCard({ asset, onEdit, onDelete }: AssetCardProps) {
  const cdi = useCdi();
  const computed = computeAsset(asset, cdi);
  const principal = asset.amountCents / 100;
  const exempt = isTaxExempt(asset.investmentType);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <Badge className={INVESTMENT_TYPE_BADGE_CLASS[asset.investmentType]}>
            {INVESTMENT_TYPE_LABELS[asset.investmentType]}
          </Badge>
        </CardTitle>
        <CardDescription>
          <Badge variant="outline" className={YIELD_TYPE_BADGE_CLASS[asset.yieldType]}>
            {YIELD_TYPE_LABELS[asset.yieldType]}
          </Badge>
        </CardDescription>
        <CardAction className="flex gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Editar" onClick={() => onEdit(asset)}>
            <Pencil />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Excluir" onClick={() => onDelete(asset.id)}>
            <Trash2 />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div>
          <Row label="Valor Aplicado" value={formatCurrency(principal)} />
          <Row label="Data da Aplicação" value={formatDate(asset.applicationDate)} />
          <Row label="Data do Resgate" value={formatDateWithDays(asset.redemptionDate, computed.calendarDays)} />
          {asset.yieldType === "pre" ? (
            <Row label="Juros Prefixados" value={formatPercentNumber(asset.preRate)} />
          ) : (
            <Row label="% do CDI" value={formatPercentNumber(asset.cdiPercent)} />
          )}
        </div>

        <Separator />

        <div>
          <Row label="Dias Corridos" value={computed.calendarDays} />
          <Row label="Dias Úteis" value={computed.businessDays} />
          <Row label="Resultado Bruto" value={formatCurrency(computed.grossAmount)} />
          <Row label="Rendimento Bruto" value={formatCurrency(computed.grossYield)} />
          <Row label="Rendimento Bruto Total" value={formatPercent(computed.grossTotalRate)} />
          <Row label="Alíquota de IR" value={exempt ? "Isento" : formatPercentNumber(computed.irRate)} />
          <Row label="Imposto sobre o Rendimento" value={formatCurrency(computed.irAmount)} />
          <Row label="Resultado Líquido" value={formatCurrency(computed.netAmount)} />
          <Row label="Rendimento Líquido" value={formatCurrency(computed.netYield)} />
          <Row label="Rentab. Líquida (dia)" value={formatPercent(computed.netDailyRate, 4)} />
          <Row label="Rentab. Líquida (mês)" value={formatPercent(computed.netMonthlyRate)} />
          <Row label="Rentab. Líquida (ano)" value={formatPercent(computed.netYearlyRate)} />
          <Row label="Rentab. Líquida Total" value={formatPercent(computed.netTotalRate)} />
          <Row label="Rentab. vs CDI" value={formatPercentNumber(computed.cdiEquivPercent)} />
        </div>
      </CardContent>
    </Card>
  );
}
