import { Plus } from "lucide-react";

type AddAssetCardProps = {
  onClick: () => void;
};

export function AddAssetCard({ onClick }: AddAssetCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card/30 text-muted-foreground transition-colors hover:border-primary/60 hover:bg-card/60 hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      aria-label="Adicionar investimento"
    >
      <Plus className="size-8" />
      <span className="text-sm font-medium">Adicionar investimento</span>
    </button>
  );
}
