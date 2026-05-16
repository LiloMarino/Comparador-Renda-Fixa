import { Pencil, Trash2 } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  formatDate,
  formatDateWithDays,
  formatPercent,
  formatPercentNumber,
  toCurrency,
} from "@/lib/format";

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
        <CardTitle>{INVESTMENT_TYPE_LABELS[asset.investmentType]}</CardTitle>
        <CardDescription>{YIELD_TYPE_LABELS[asset.yieldType]}</CardDescription>
        <CardAction className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Editar"
            onClick={() => onEdit(asset)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Excluir"
            onClick={() => onDelete(asset.id)}
          >
            <Trash2 />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div>
          <Row label="Valor Aplicado" value={toCurrency(principal)} />
          <Row
            label="Data da Aplicação"
            value={formatDate(asset.applicationDate)}
          />
          <Row
            label="Data do Resgate"
            value={formatDateWithDays(
              asset.redemptionDate,
              computed.calendarDays,
            )}
          />
          {asset.yieldType === "pre" ? (
            <Row
              label="Juros Prefixados"
              value={formatPercentNumber(asset.preRate)}
            />
          ) : (
            <Row
              label="% do CDI"
              value={formatPercentNumber(asset.cdiPercent)}
            />
          )}
        </div>

        <Separator />

        <div>
          <Row label="Dias Corridos" value={computed.calendarDays} />
          <Row label="Dias Úteis" value={computed.businessDays} />
          <Row label="Resultado Bruto" value={toCurrency(computed.grossAmount)} />
          <Row
            label="Rendimento Bruto"
            value={toCurrency(computed.grossYield)}
          />
          <Row
            label="Rendimento Bruto Total"
            value={formatPercent(computed.grossTotalRate)}
          />
          <Row
            label="Alíquota de IR"
            value={
              exempt ? "Isento" : formatPercentNumber(computed.irRate)
            }
          />
          <Row
            label="Imposto sobre o Rendimento"
            value={toCurrency(computed.irAmount)}
          />
          <Row
            label="Resultado Líquido"
            value={toCurrency(computed.netAmount)}
          />
          <Row
            label="Rendimento Líquido"
            value={toCurrency(computed.netYield)}
          />
          <Row
            label="Rentab. Líquida (dia)"
            value={formatPercent(computed.netDailyRate, 4)}
          />
          <Row
            label="Rentab. Líquida (mês)"
            value={formatPercent(computed.netMonthlyRate)}
          />
          <Row
            label="Rentab. Líquida (ano)"
            value={formatPercent(computed.netYearlyRate)}
          />
          <Row
            label="Rentab. Líquida Total"
            value={formatPercent(computed.netTotalRate)}
          />
          <Row
            label="Rentab. vs CDI"
            value={formatPercentNumber(computed.cdiEquivPercent)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
