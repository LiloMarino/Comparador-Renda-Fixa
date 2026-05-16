import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
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
import {
  useSelic,
  useSelicUpdatedAt,
  useSettingsStore,
} from "@/hooks/use-settings-store";
import { selicToCdi } from "@/lib/cdi";
import { maskPositiveDecimal, normalizeDecimalInput } from "@/lib/mask";
import {
  formatDate,
  formatPercentNumber,
  parseDecimalBrazilian,
} from "@/lib/format";

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open ? <SettingsForm onClose={() => onOpenChange(false)} /> : null}
      </DialogContent>
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
  const { theme, setTheme } = useTheme();

  const [selicInput, setSelicInput] = useState(() =>
    decimalString(currentSelic),
  );

  const parsedSelic = parseDecimalBrazilian(normalizeDecimalInput(selicInput));
  const previewCdi = selicToCdi(parsedSelic);
  const canSave = parsedSelic > 0;

  function handleSave() {
    if (!canSave) return;
    setSelic(parsedSelic);
    onClose();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Configurações</DialogTitle>
        <DialogDescription>
          Defina a SELIC atual. O CDI é inferido automaticamente
          (SELIC − 0,10).
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Tema</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
            >
              <Sun />
              Claro
            </Button>
            <Button
              type="button"
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
            >
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
            onChange={(e) =>
              setSelicInput(maskPositiveDecimal(e.target.value, { scale: 2 }))
            }
            placeholder="14,50"
          />
        </div>

        <div className="grid gap-2">
          <Label>CDI (% a.a.)</Label>
          <div className="rounded-md border border-input bg-muted/40 px-2.5 py-2 text-sm">
            {formatPercentNumber(previewCdi)}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Última atualização: {formatDate(updatedAt) || "—"}
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
