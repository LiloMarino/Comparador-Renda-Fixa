import { useEffect } from "react";
import { toast } from "sonner";
import { AssetGrid } from "@/features/comparator/components/asset-grid";
import { useSelicUpdatedAt } from "@/hooks/use-settings-store";
import { isSelicStale } from "@/lib/cdi";

export function ComparatorPage() {
  const updatedAt = useSelicUpdatedAt();

  useEffect(() => {
    if (isSelicStale(updatedAt)) {
      toast.warning(
        "SELIC pode estar desatualizada — confira em Configurações.",
      );
    }
  }, [updatedAt]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Comparação</h2>
        <p className="text-sm text-muted-foreground">
          Adicione ativos para comparar rendimento líquido, IR e equivalência ao
          CDI.
        </p>
      </div>
      <AssetGrid />
    </div>
  );
}
