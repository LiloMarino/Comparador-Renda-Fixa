import { useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { addBusinessDays, format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { maskCurrency, maskOnlyNumbers, maskPercent } from "@/lib/mask";
import { formatCurrency } from "@/lib/format";
import { parseLocaleNumber } from "@/lib/parse";
import {
  INVESTMENT_TYPE_LABELS,
  YIELD_TYPE_LABELS,
  type Asset,
  type AssetWithId,
  type InvestmentType,
  type YieldType,
} from "@/features/comparator/schemas/asset-schema";

type RedemptionInputMode = "date" | "term";

type FormValues = {
  investmentType: InvestmentType;
  yieldType: YieldType;
  amountInput: string;
  applicationDate: Date | undefined;
  redemptionInputMode: RedemptionInputMode;
  redemptionDate: Date | undefined;
  termDays: string;
  preRate: string;
  cdiPercent: string;
};

type AssetFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initialAsset?: AssetWithId;
  onOpenChange: (open: boolean) => void;
  onSubmit: (asset: Asset) => void;
};

const DEFAULT_VALUES: FormValues = {
  investmentType: "CDB",
  yieldType: "pos",
  amountInput: "",
  applicationDate: undefined,
  redemptionInputMode: "term",
  redemptionDate: undefined,
  termDays: "",
  preRate: "",
  cdiPercent: "",
};

function decimalString(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function assetToFormValues(asset: AssetWithId): FormValues {
  return {
    investmentType: asset.investmentType,
    yieldType: asset.yieldType,
    amountInput: formatCurrency(asset.amountCents / 100),
    applicationDate: asset.applicationDate,
    redemptionInputMode: "date",
    redemptionDate: asset.redemptionDate,
    termDays: "",
    preRate: asset.yieldType === "pre" ? maskPercent(decimalString(asset.preRate)) : "",
    cdiPercent: asset.yieldType === "pos" ? maskPercent(decimalString(asset.cdiPercent)) : "",
  };
}

export function AssetFormDialog({ open, mode, initialAsset, onOpenChange, onSubmit }: AssetFormDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: DEFAULT_VALUES });

  useEffect(() => {
    if (open) {
      reset(initialAsset ? assetToFormValues(initialAsset) : DEFAULT_VALUES);
    }
  }, [open, initialAsset, reset]);

  const yieldType = useWatch({ control, name: "yieldType" });
  const redemptionInputMode = useWatch({
    control,
    name: "redemptionInputMode",
  });

  function submit(values: FormValues) {
    const amountCents = Math.round(parseLocaleNumber(values.amountInput) * 100);
    if (amountCents <= 0) {
      setError("amountInput", { message: "Informe o valor aplicado." });
      return;
    }
    if (!values.applicationDate || !isValid(values.applicationDate)) {
      setError("applicationDate", { message: "Informe a data da aplicação." });
      return;
    }

    let redemptionDate: Date | undefined;
    if (values.redemptionInputMode === "date") {
      if (!values.redemptionDate || !isValid(values.redemptionDate)) {
        setError("redemptionDate", { message: "Informe a data de resgate." });
        return;
      }
      redemptionDate = values.redemptionDate;
    } else {
      const days = Number(values.termDays);
      if (!Number.isFinite(days) || days <= 0) {
        setError("termDays", { message: "Informe um prazo em dias válido." });
        return;
      }
      redemptionDate = addBusinessDays(values.applicationDate, days);
    }

    if (redemptionDate <= values.applicationDate) {
      setError("redemptionDate", {
        message: "A data de resgate deve ser posterior à aplicação.",
      });
      return;
    }

    const common = {
      investmentType: values.investmentType,
      amountCents,
      applicationDate: values.applicationDate,
      redemptionDate,
    };

    let asset: Asset;
    if (values.yieldType === "pre") {
      const rate = parseLocaleNumber(values.preRate);
      if (!Number.isFinite(rate) || rate <= 0) {
        setError("preRate", { message: "Informe a taxa pré-fixada." });
        return;
      }
      asset = { ...common, yieldType: "pre", preRate: rate };
    } else {
      const pct = parseLocaleNumber(values.cdiPercent);
      if (!Number.isFinite(pct) || pct <= 0) {
        setError("cdiPercent", { message: "Informe o % do CDI." });
        return;
      }
      asset = { ...common, yieldType: "pos", cdiPercent: pct };
    }

    onSubmit(asset);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Novo investimento" : "Editar investimento"}</DialogTitle>
          <DialogDescription>Preencha os dados do ativo de renda fixa para incluí-lo na comparação.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="grid gap-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="investmentType">Tipo de Investimento</Label>
              <Controller
                control={control}
                name="investmentType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="investmentType" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["CDB", "LCI", "LCA"] as const).map((t) => (
                        <SelectItem key={t} value={t}>
                          {INVESTMENT_TYPE_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="yieldType">Tipo de Rentabilidade</Label>
              <Controller
                control={control}
                name="yieldType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="yieldType" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["pre", "pos"] as const).map((t) => (
                        <SelectItem key={t} value={t}>
                          {YIELD_TYPE_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amountInput">Valor Aplicado (R$)</Label>
            <Controller
              control={control}
              name="amountInput"
              render={({ field }) => (
                <Input
                  id="amountInput"
                  inputMode="numeric"
                  value={field.value}
                  onChange={(e) => field.onChange(maskCurrency(e.target.value))}
                  placeholder="R$ 0,00"
                  aria-invalid={!!errors.amountInput}
                />
              )}
            />
            {errors.amountInput && <p className="text-xs text-destructive">{errors.amountInput.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label>Data da Aplicação</Label>
            <Controller
              control={control}
              name="applicationDate"
              render={({ field }) => (
                <DatePickerField value={field.value} onChange={field.onChange} invalid={!!errors.applicationDate} />
              )}
            />
            {errors.applicationDate && <p className="text-xs text-destructive">{errors.applicationDate.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label>Resgate</Label>
            <Controller
              control={control}
              name="redemptionInputMode"
              render={({ field }) => (
                <Tabs value={field.value} onValueChange={(v) => field.onChange(v as RedemptionInputMode)}>
                  <TabsList className="w-full">
                    <TabsTrigger value="date" className="flex-1">
                      Por data de resgate
                    </TabsTrigger>
                    <TabsTrigger value="term" className="flex-1">
                      Por prazo em dias
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            />

            {redemptionInputMode === "date" ? (
              <>
                <Controller
                  control={control}
                  name="redemptionDate"
                  render={({ field }) => (
                    <DatePickerField value={field.value} onChange={field.onChange} invalid={!!errors.redemptionDate} />
                  )}
                />
                {errors.redemptionDate && <p className="text-xs text-destructive">{errors.redemptionDate.message}</p>}
              </>
            ) : (
              <>
                <Controller
                  control={control}
                  name="termDays"
                  render={({ field }) => (
                    <Input
                      inputMode="numeric"
                      value={field.value}
                      onChange={(e) => field.onChange(maskOnlyNumbers(e.target.value))}
                      placeholder="360"
                      aria-invalid={!!errors.termDays}
                    />
                  )}
                />
                {errors.termDays && <p className="text-xs text-destructive">{errors.termDays.message}</p>}
              </>
            )}
          </div>

          {yieldType === "pre" ? (
            <div className="grid gap-2">
              <Label htmlFor="preRate">Juros Prefixados (% a.a.)</Label>
              <Controller
                control={control}
                name="preRate"
                render={({ field }) => (
                  <Input
                    id="preRate"
                    inputMode="decimal"
                    value={field.value}
                    onChange={(e) => field.onChange(maskPercent(e.target.value))}
                    placeholder="12,50%"
                    aria-invalid={!!errors.preRate}
                  />
                )}
              />
              {errors.preRate && <p className="text-xs text-destructive">{errors.preRate.message}</p>}
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="cdiPercent">% do CDI</Label>
              <Controller
                control={control}
                name="cdiPercent"
                render={({ field }) => (
                  <Input
                    id="cdiPercent"
                    inputMode="decimal"
                    value={field.value}
                    onChange={(e) => field.onChange(maskPercent(e.target.value))}
                    placeholder="100,00%"
                    aria-invalid={!!errors.cdiPercent}
                  />
                )}
              />
              {errors.cdiPercent && <p className="text-xs text-destructive">{errors.cdiPercent.message}</p>}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{mode === "create" ? "Criar" : "Salvar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type DatePickerFieldProps = {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  invalid?: boolean;
};

function DatePickerField({ value, onChange, invalid }: DatePickerFieldProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("w-full justify-start font-normal", !value && "text-muted-foreground")}
          aria-invalid={invalid}
        >
          <CalendarIcon />
          {value ? format(value, "dd/MM/yyyy") : "Selecionar data"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} locale={ptBR} captionLayout="dropdown" />
      </PopoverContent>
    </Popover>
  );
}
