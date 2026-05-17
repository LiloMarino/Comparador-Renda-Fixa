import { useState } from "react";
import { toast } from "sonner";
import { AssetCard } from "@/features/comparator/components/asset-card";
import { AddAssetCard } from "@/features/comparator/components/add-asset-card";
import { AssetFormDialog } from "@/features/comparator/components/asset-form-dialog";
import { useAssetsStore } from "@/features/comparator/hooks/use-assets-store";
import type { Asset, AssetWithId } from "@/features/comparator/schemas/asset-schema";

export function AssetGrid() {
  const ids = useAssetsStore((s) => s.ids);
  const assets = useAssetsStore((s) => s.assets);
  const addAsset = useAssetsStore((s) => s.addAsset);
  const updateAsset = useAssetsStore((s) => s.updateAsset);
  const removeAsset = useAssetsStore((s) => s.removeAsset);
  const [open, setOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetWithId | undefined>(undefined);

  function handleSubmit(asset: Asset) {
    if (selectedAsset) {
      updateAsset(selectedAsset.id, asset);
      toast.success("Investimento atualizado");
    } else {
      addAsset(asset);
      toast.success("Investimento criado");
    }
    setOpen(false);
    setSelectedAsset(undefined);
  }

  function handleEdit(asset: AssetWithId) {
    setSelectedAsset(asset);
    setOpen(true);
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
          return <AssetCard key={id} asset={asset} onEdit={handleEdit} onDelete={handleDelete} />;
        })}
        <AddAssetCard onClick={() => setOpen(true)} />
      </div>

      <AssetFormDialog
        key={open ? (selectedAsset?.id ?? "create") : undefined}
        open={open}
        asset={selectedAsset}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) setSelectedAsset(undefined);
        }}
        onSubmit={handleSubmit}
      />
    </>
  );
}
