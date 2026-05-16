import { useState } from "react";
import { toast } from "sonner";
import { AssetCard } from "@/features/comparator/components/asset-card";
import { AddAssetCard } from "@/features/comparator/components/add-asset-card";
import { AssetFormDialog } from "@/features/comparator/components/asset-form-dialog";
import { useAssetsStore } from "@/features/comparator/hooks/use-assets-store";
import type {
  Asset,
  AssetWithId,
} from "@/features/comparator/schemas/asset-schema";

type DialogState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; asset: AssetWithId };

export function AssetGrid() {
  const ids = useAssetsStore((s) => s.ids);
  const assets = useAssetsStore((s) => s.assets);
  const addAsset = useAssetsStore((s) => s.addAsset);
  const updateAsset = useAssetsStore((s) => s.updateAsset);
  const removeAsset = useAssetsStore((s) => s.removeAsset);

  const [dialog, setDialog] = useState<DialogState>({ mode: "closed" });

  function handleSubmit(asset: Asset) {
    if (dialog.mode === "create") {
      addAsset(asset);
      toast.success("Investimento criado");
    } else if (dialog.mode === "edit") {
      updateAsset(dialog.asset.id, asset);
      toast.success("Investimento atualizado");
    }
    setDialog({ mode: "closed" });
  }

  function handleDelete(id: string) {
    removeAsset(id);
    toast.success("Investimento removido");
  }

  return (
    <>
      <div className="grid auto-rows-fr gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ids.map((id) => {
          const asset = assets[id];
          if (!asset) return null;
          return (
            <AssetCard
              key={id}
              asset={asset}
              onEdit={(a) => setDialog({ mode: "edit", asset: a })}
              onDelete={handleDelete}
            />
          );
        })}
        <AddAssetCard onClick={() => setDialog({ mode: "create" })} />
      </div>

      <AssetFormDialog
        open={dialog.mode !== "closed"}
        mode={dialog.mode === "edit" ? "edit" : "create"}
        initialAsset={dialog.mode === "edit" ? dialog.asset : undefined}
        onOpenChange={(open) => {
          if (!open) setDialog({ mode: "closed" });
        }}
        onSubmit={handleSubmit}
      />
    </>
  );
}
