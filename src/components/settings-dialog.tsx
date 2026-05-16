import { useState } from "react";
import { CalendarIcon, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useSelic, useSelicUpdatedAt, useSettingsStore } from "@/hooks/use-settings-store";
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
      <DialogContent>{open ? <SettingsForm onClose={() => onOpenChange(false)} /> : null}</DialogContent>
    </Dialog>
  );
}

function decimalString(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function SettingsForm({ onClose }: { onClose: () => void }) {
  const currentSelic = useSelic();
  const updatedAt = useSelicUpdatedAt();
  const setSelic = useSettingsStore((s) => s.setSelic);
  const currentGlobalAmountCents = useSettingsStore((s) => s.globalAmountCents);
  const currentGlobalApplicationDate = useSettingsStore((s) => s.globalApplicationDate);
  const setGlobalAmountCents = useSettingsStore((s) => s.setGlobalAmountCents);
  const setGlobalApplicationDate = useSettingsStore((s) => s.setGlobalApplicationDate);
  const { theme, setTheme } = useTheme();

  const [selicInput, setSelicInput] = useState(() => maskPercent(decimalString(currentSelic)));
  const [amountInput, setAmountInput] = useState(() =>
    currentGlobalAmountCents !== null ? formatCurrency(currentGlobalAmountCents / 100) : "",
  );
  const [applicationDateLocal, setApplicationDateLocal] = useState<Date | undefined>(() => {
    if (!currentGlobalApplicationDate) return undefined;
    const parsed = parseISO(currentGlobalApplicationDate);
    return isValid(parsed) ? parsed : undefined;
  });

  const parsedSelic = parseLocaleNumber(selicInput);
  const previewCdi = selicToCdi(parsedSelic);
  const canSave = parsedSelic > 0;

  function handleSave() {
    if (!canSave) return;
    setSelic(parsedSelic);

    const parsedAmount = parseLocaleNumber(amountInput);
    const amountCents = Math.round(parsedAmount * 100);
    setGlobalAmountCents(amountInput && amountCents > 0 ? amountCents : null);
    setGlobalApplicationDate(applicationDateLocal ? applicationDateLocal.toISOString() : null);

    onClose();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Configurações</DialogTitle>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Tema</Label>
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

        <div className="grid gap-2">
          <Label htmlFor="selic-input">SELIC (% a.a.)</Label>
          <Input
            id="selic-input"
            inputMode="decimal"
            value={selicInput}
            onChange={(e) => setSelicInput(maskPercent(e.target.value))}
            placeholder="14,50%"
          />
        </div>

        <div className="grid gap-2">
          <Label>CDI (% a.a.)</Label>
          <div className="rounded-md border border-input bg-muted/40 px-2.5 py-2 text-sm">
            {formatPercentNumber(previewCdi)}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">Última atualização: {formatDate(updatedAt) || "—"}</div>

        <Separator />

        <p className="text-sm font-medium">Padrões de Aplicação</p>

        <div className="grid gap-2">
          <Label htmlFor="global-amount">Valor Aplicado (R$)</Label>
          <Input
            id="global-amount"
            inputMode="numeric"
            value={amountInput}
            onChange={(e) => setAmountInput(maskCurrency(e.target.value))}
            placeholder="R$ 0,00"
          />
        </div>

        <div className="grid gap-2">
          <Label>Data da Aplicação</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn("w-full justify-start font-normal", !applicationDateLocal && "text-muted-foreground")}
              >
                <CalendarIcon />
                {applicationDateLocal ? format(applicationDateLocal, "dd/MM/yyyy") : "Selecionar data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={applicationDateLocal}
                onSelect={setApplicationDateLocal}
                locale={ptBR}
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
          {applicationDateLocal && (
            <button
              type="button"
              className="self-start text-xs text-muted-foreground hover:text-destructive"
              onClick={() => setApplicationDateLocal(undefined)}
            >
              Limpar data
            </button>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={!canSave}>
          Salvar
        </Button>
      </DialogFooter>
    </>
  );
}
