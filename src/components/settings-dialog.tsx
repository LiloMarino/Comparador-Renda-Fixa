import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useShallow } from "zustand/react/shallow";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { useSettingsStore, useGlobalApplicationDate } from "@/hooks/use-settings-store";
import { selicToCdi } from "@/lib/cdi";
import { maskCurrency, maskPercent } from "@/lib/mask";
import { formatCurrency, formatDate, formatPercentNumber } from "@/lib/format";
import { parseLocaleNumber } from "@/lib/parse";
import { cn } from "@/lib/utils";

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-0 p-0">
        {open ? <SettingsForm onClose={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

const formSchema = z.object({
  selicInput: z.string().refine((val) => parseLocaleNumber(val) > 0, "Informe uma taxa SELIC válida."),
  amountInput: z.string(),
  applicationDate: z.date().optional(),
});

type FormValues = z.input<typeof formSchema>;

function SettingsForm({ onClose }: { onClose: () => void }) {
  const {
    selic,
    selicUpdatedAt,
    globalAmountCents,
    showBadges,
    setSelic,
    setGlobalAmountCents,
    setGlobalApplicationDate,
    setShowBadges,
  } = useSettingsStore(
    useShallow((s) => ({
      selic: s.selic,
      selicUpdatedAt: s.selicUpdatedAt,
      globalAmountCents: s.globalAmountCents,
      showBadges: s.showBadges,
      setSelic: s.setSelic,
      setGlobalAmountCents: s.setGlobalAmountCents,
      setGlobalApplicationDate: s.setGlobalApplicationDate,
      setShowBadges: s.setShowBadges,
    })),
  );
  const globalApplicationDate = useGlobalApplicationDate();
  const { theme, setTheme } = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selicInput: maskPercent(selic.toFixed(2)),
      amountInput: globalAmountCents !== null ? formatCurrency(globalAmountCents / 100) : "",
      applicationDate: globalApplicationDate ?? undefined,
    },
  });

  const selicInput = useWatch({ control, name: "selicInput" });
  const previewCdi = selicToCdi(parseLocaleNumber(selicInput));

  function onSubmit(data: FormValues) {
    setSelic(parseLocaleNumber(data.selicInput));

    const parsedAmount = parseLocaleNumber(data.amountInput);
    const amountCents = Math.round(parsedAmount * 100);
    setGlobalAmountCents(data.amountInput && amountCents > 0 ? amountCents : null);
    setGlobalApplicationDate(data.applicationDate ? data.applicationDate.toISOString() : null);

    onClose();
  }

  return (
    <>
      <DialogHeader className="px-6 pt-6 pb-4">
        <DialogTitle>Configurações</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col" noValidate>
        <div className="grid flex-1 gap-4 overflow-y-auto px-6 pb-4">
        <div className="grid gap-0.5">
          <p className="text-sm font-medium">Aparência</p>
          <p className="text-xs text-muted-foreground">Personalize o visual da aplicação.</p>
        </div>

        <div className="grid gap-2">
          <FieldLabel>Tema</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")}>
              <Sun />
              Claro
            </Button>
            <Button type="button" variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")}>
              <Moon />
              Escuro
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <FieldLabel>Badges nos Cards</FieldLabel>
          <Switch checked={showBadges} onCheckedChange={setShowBadges} />
        </div>

        <Separator />

        <div className="grid gap-0.5">
          <p className="text-sm font-medium">Taxa de Referência</p>
          <p className="text-xs text-muted-foreground">Usada como base para cálculo dos rendimentos.</p>
        </div>

        <Field data-invalid={!!errors.selicInput}>
          <FieldLabel htmlFor="selic-input">SELIC (% a.a.)</FieldLabel>
          <Controller
            control={control}
            name="selicInput"
            render={({ field }) => (
              <FieldContent>
                <Input
                  id="selic-input"
                  inputMode="decimal"
                  value={field.value}
                  onChange={(e) => field.onChange(maskPercent(e.target.value))}
                  placeholder="14,50"
                  aria-invalid={!!errors.selicInput}
                />
              </FieldContent>
            )}
          />
          <FieldError>{errors.selicInput?.message}</FieldError>
        </Field>

        <div className="grid gap-2">
          <FieldLabel>CDI (% a.a.)</FieldLabel>
          <div className="rounded-md border border-input bg-muted/40 px-2.5 py-2 text-sm">
            {formatPercentNumber(previewCdi)}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">Última atualização: {formatDate(selicUpdatedAt) || "—"}</div>

        <Separator />

        <div className="grid gap-0.5">
          <p className="text-sm font-medium">Valores Globais</p>
          <p className="text-xs text-muted-foreground">
            Quando definidos, substituem os valores individuais de todos os ativos.
          </p>
        </div>

        <Field data-invalid={!!errors.amountInput}>
          <FieldLabel htmlFor="global-amount">Valor Aplicado (R$)</FieldLabel>
          <Controller
            control={control}
            name="amountInput"
            render={({ field }) => (
              <FieldContent>
                <Input
                  id="global-amount"
                  inputMode="numeric"
                  value={field.value}
                  onChange={(e) => field.onChange(maskCurrency(e.target.value))}
                  placeholder="R$ 0,00"
                  aria-invalid={!!errors.amountInput}
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn("w-full justify-start font-normal", !field.value && "text-muted-foreground")}
                      aria-invalid={!!errors.applicationDate}
                    >
                      <CalendarIcon />
                      {field.value ? format(field.value, "dd/MM/yyyy") : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      locale={ptBR}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
                {field.value && (
                  <button
                    type="button"
                    className="self-start text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => field.onChange(undefined)}
                  >
                    Limpar data
                  </button>
                )}
              </FieldContent>
            )}
          />
          <FieldError>{errors.applicationDate?.message}</FieldError>
        </Field>
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Salvar</Button>
        </DialogFooter>
      </form>
    </>
  );
}
