import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";
import { AssetCard } from "@/features/comparator/components/asset-card";
import { AddAssetCard } from "@/features/comparator/components/add-asset-card";
import { AssetFormDialog } from "@/features/comparator/components/asset-form-dialog";
import { useAssetsStore } from "@/features/comparator/hooks/use-assets-store";
import { useGlobalAmountCents, useGlobalApplicationDate } from "@/hooks/use-settings-store";
import type { Asset, AssetWithId } from "@/features/comparator/schemas/asset-schema";

export function AssetGrid() {
  const { ids, assets, addAsset, updateAsset, removeAsset } = useAssetsStore(
    useShallow((s) => ({
      ids: s.ids,
      assets: s.assets,
      addAsset: s.addAsset,
      updateAsset: s.updateAsset,
      removeAsset: s.removeAsset,
    })),
  );
  const [open, setOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetWithId | undefined>(undefined);

  const globalAmountCents = useGlobalAmountCents();
  const globalApplicationDate = useGlobalApplicationDate();

  function applyGlobals(asset: AssetWithId): AssetWithId {
    return {
      ...asset,
      ...(globalAmountCents !== null && { amountCents: globalAmountCents }),
      ...(globalApplicationDate !== null && { applicationDate: globalApplicationDate }),
    };
  }

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
          return <AssetCard key={id} asset={applyGlobals(asset)} onEdit={() => handleEdit(asset)} onDelete={handleDelete} />;
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
