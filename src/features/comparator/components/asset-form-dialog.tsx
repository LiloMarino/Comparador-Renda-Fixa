import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { coalesceWithDefaults } from "@/lib/coalesce";
import { maskCurrency, maskOnlyNumbers, maskPercent } from "@/lib/mask";
import { formatCurrency } from "@/lib/format";
import { parseLocaleNumber } from "@/lib/parse";
import {
  INVESTMENT_TYPES,
  YIELD_TYPES,
  REDEMPTION_INPUT_MODES,
  type RedemptionInputMode,
} from "@/lib/enum";
import {
  INVESTMENT_TYPE_LABELS,
  YIELD_TYPE_LABELS,
  type Asset,
  type AssetWithId,
} from "@/features/comparator/schemas/asset-schema";
import { useAssetsStore } from "@/features/comparator/hooks/use-assets-store";
import { useGlobalAmountCents, useGlobalApplicationDate } from "@/hooks/use-settings-store";

const formSchema = z
  .object({
    name: z.string().min(1, "Informe o nome do investimento.").max(60),
    investmentType: z.enum(INVESTMENT_TYPES),
    yieldType: z.enum(YIELD_TYPES),
    amountInput: z
      .string()
      .min(1, "Valor aplicado é obrigatório")
      .refine((val) => parseLocaleNumber(val) > 0, "Informe o valor aplicado."),
    applicationDate: z.date({ message: "Informe a data da aplicação." }),
    redemptionInputMode: z.enum(REDEMPTION_INPUT_MODES),
    redemptionDate: z.date().optional(),
    termDays: z.string(),
    preRate: z.string(),
    cdiPercent: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.redemptionInputMode === "date") {
      if (!data.redemptionDate || !isValid(data.redemptionDate)) {
        ctx.addIssue({ code: "custom", message: "Informe a data de resgate.", path: ["redemptionDate"] });
      } else if (data.applicationDate && data.redemptionDate <= data.applicationDate) {
        ctx.addIssue({
          code: "custom",
          message: "A data de resgate deve ser posterior à aplicação.",
          path: ["redemptionDate"],
        });
      }
    } else {
      const days = Number(data.termDays);
      if (!Number.isFinite(days) || days <= 0) {
        ctx.addIssue({ code: "custom", message: "Informe um prazo em dias válido.", path: ["termDays"] });
      }
    }

    if (data.yieldType === "pre") {
      const rate = parseLocaleNumber(data.preRate);
      if (!Number.isFinite(rate) || rate <= 0)
        ctx.addIssue({ code: "custom", message: "Informe a taxa pré-fixada.", path: ["preRate"] });
    } else {
      const pct = parseLocaleNumber(data.cdiPercent);
      if (!Number.isFinite(pct) || pct <= 0)
        ctx.addIssue({ code: "custom", message: "Informe o % do CDI.", path: ["cdiPercent"] });
    }
  });

type FormValues = z.input<typeof formSchema>;

type AssetFormDialogProps = {
  open: boolean;
  asset?: AssetWithId;
  onOpenChange: (open: boolean) => void;
  onSubmit: (asset: Asset) => void;
};

const DEFAULT_VALUES: FormValues = {
  name: "",
  investmentType: "CDB",
  yieldType: "pos",
  amountInput: "",
  applicationDate: undefined as unknown as Date,
  redemptionInputMode: "term",
  redemptionDate: undefined,
  termDays: "",
  preRate: "",
  cdiPercent: "",
};

export function AssetFormDialog({ open, asset, onOpenChange, onSubmit }: AssetFormDialogProps) {
  const mode = asset ? "edit" : "create";

  const globalAmountCents = useGlobalAmountCents();
  const globalApplicationDate = useGlobalApplicationDate();
  const assetsCount = useAssetsStore((s) => s.assets.length);

  const initialValues = coalesceWithDefaults(
    {
      ...(asset ?? {}),
      name: asset?.name ?? `Investimento #${assetsCount + 1}`,
      amountInput:
        globalAmountCents !== null
          ? formatCurrency(globalAmountCents / 100)
          : asset
            ? formatCurrency(asset.amountCents / 100)
            : undefined,
      applicationDate: globalApplicationDate ?? asset?.applicationDate,
      redemptionInputMode: asset ? ("date" as RedemptionInputMode) : undefined,
      preRate: asset?.yieldType === "pre" ? maskPercent(String(asset.preRate)) : undefined,
      cdiPercent: asset?.yieldType === "pos" ? maskPercent(String(asset.cdiPercent)) : undefined,
    },
    DEFAULT_VALUES,
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const yieldType = useWatch({ control, name: "yieldType" });
  const redemptionInputMode = useWatch({ control, name: "redemptionInputMode" });

  function submit(data: FormValues) {
    const amountCents = Math.round(parseLocaleNumber(data.amountInput) * 100);
    const redemptionDate =
      data.redemptionInputMode === "date"
        ? data.redemptionDate!
        : addBusinessDays(data.applicationDate, Number(data.termDays));

    const common = {
      name: data.name.trim(),
      investmentType: data.investmentType,
      amountCents,
      applicationDate: data.applicationDate,
      redemptionDate,
    };

    const result: Asset =
      data.yieldType === "pre"
        ? { ...common, yieldType: "pre", preRate: parseLocaleNumber(data.preRate) }
        : { ...common, yieldType: "pos", cdiPercent: parseLocaleNumber(data.cdiPercent) };

    onSubmit(result);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Novo investimento" : "Editar investimento"}</DialogTitle>
          <DialogDescription>Preencha os dados do ativo de renda fixa para incluí-lo na comparação.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="grid gap-4" noValidate>
          <Field data-invalid={!!errors.name}>
            <FieldLabel>Nome</FieldLabel>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <FieldContent>
                  <Input
                    id="name"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    maxLength={60}
                    placeholder="Investimento #1"
                    aria-invalid={!!errors.name}
                  />
                </FieldContent>
              )}
            />
            <FieldError>{errors.name?.message}</FieldError>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field data-invalid={!!errors.investmentType}>
              <FieldLabel>Tipo de Investimento</FieldLabel>
              <Controller
                control={control}
                name="investmentType"
                render={({ field }) => (
                  <FieldContent>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full" aria-invalid={!!errors.investmentType}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INVESTMENT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {INVESTMENT_TYPE_LABELS[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldContent>
                )}
              />
              <FieldError>{errors.investmentType?.message}</FieldError>
            </Field>

            <Field data-invalid={!!errors.yieldType}>
              <FieldLabel>Tipo de Rentabilidade</FieldLabel>
              <Controller
                control={control}
                name="yieldType"
                render={({ field }) => (
                  <FieldContent>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full" aria-invalid={!!errors.yieldType}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {YIELD_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {YIELD_TYPE_LABELS[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldContent>
                )}
              />
              <FieldError>{errors.yieldType?.message}</FieldError>
            </Field>
          </div>

          <Field data-invalid={!!errors.amountInput}>
            <FieldLabel>Valor Aplicado (R$)</FieldLabel>
            <Controller
              control={control}
              name="amountInput"
              render={({ field }) => (
                <FieldContent>
                  <Input
                    id="amountInput"
                    inputMode="numeric"
                    value={field.value}
                    onChange={(e) => field.onChange(maskCurrency(e.target.value))}
                    placeholder="R$ 0,00"
                    aria-invalid={!!errors.amountInput}
                    disabled={globalAmountCents !== null}
                  />
                </FieldContent>
              )}
            />
            <FieldError>{errors.amountInput?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.applicationDate}>
            <FieldLabel>Data da Aplicação</FieldLabel>
            <Controller
              control={control}
              name="applicationDate"
              render={({ field }) => (
                <FieldContent>
                  <DatePickerField
                    value={field.value}
                    onChange={field.onChange}
                    invalid={!!errors.applicationDate}
                    disabled={globalApplicationDate !== null}
                  />
                </FieldContent>
              )}
            />
            <FieldError>{errors.applicationDate?.message}</FieldError>
          </Field>

          <div className="grid gap-2">
            <FieldLabel>Resgate</FieldLabel>
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
              <Field data-invalid={!!errors.redemptionDate}>
                <Controller
                  control={control}
                  name="redemptionDate"
                  render={({ field }) => (
                    <FieldContent>
                      <DatePickerField
                        value={field.value}
                        onChange={field.onChange}
                        invalid={!!errors.redemptionDate}
                      />
                    </FieldContent>
                  )}
                />
                <FieldError>{errors.redemptionDate?.message}</FieldError>
              </Field>
            ) : (
              <Field data-invalid={!!errors.termDays}>
                <Controller
                  control={control}
                  name="termDays"
                  render={({ field }) => (
                    <FieldContent>
                      <Input
                        inputMode="numeric"
                        value={field.value}
                        onChange={(e) => field.onChange(maskOnlyNumbers(e.target.value))}
                        placeholder="360"
                        aria-invalid={!!errors.termDays}
                      />
                    </FieldContent>
                  )}
                />
                <FieldError>{errors.termDays?.message}</FieldError>
              </Field>
            )}
          </div>

          {yieldType === "pre" ? (
            <Field data-invalid={!!errors.preRate}>
              <FieldLabel>Juros Prefixados (% a.a.)</FieldLabel>
              <Controller
                control={control}
                name="preRate"
                render={({ field }) => (
                  <FieldContent>
                    <Input
                      id="preRate"
                      inputMode="decimal"
                      value={field.value}
                      onChange={(e) => field.onChange(maskPercent(e.target.value))}
                      placeholder="12,50%"
                      aria-invalid={!!errors.preRate}
                    />
                  </FieldContent>
                )}
              />
              <FieldError>{errors.preRate?.message}</FieldError>
            </Field>
          ) : (
            <Field data-invalid={!!errors.cdiPercent}>
              <FieldLabel>% do CDI</FieldLabel>
              <Controller
                control={control}
                name="cdiPercent"
                render={({ field }) => (
                  <FieldContent>
                    <Input
                      id="cdiPercent"
                      inputMode="decimal"
                      value={field.value}
                      onChange={(e) => field.onChange(maskPercent(e.target.value))}
                      placeholder="100,00%"
                      aria-invalid={!!errors.cdiPercent}
                    />
                  </FieldContent>
                )}
              />
              <FieldError>{errors.cdiPercent?.message}</FieldError>
            </Field>
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
  disabled?: boolean;
};

function DatePickerField({ value, onChange, invalid, disabled }: DatePickerFieldProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("w-full justify-start font-normal", !value && "text-muted-foreground")}
          aria-invalid={invalid}
          disabled={disabled}
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
