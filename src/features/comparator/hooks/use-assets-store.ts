import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Asset,
  AssetWithId,
} from "@/features/comparator/schemas/asset-schema";

type AssetsState = {
  assets: Record<string, AssetWithId>;
  ids: string[];
  addAsset: (asset: Asset) => string;
  updateAsset: (id: string, asset: Asset) => void;
  removeAsset: (id: string) => void;
};

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useAssetsStore = create<AssetsState>()(
  persist(
    (set) => ({
      assets: {},
      ids: [],
      addAsset: (asset) => {
        const id = generateId();
        set((state) => ({
          assets: { ...state.assets, [id]: { ...asset, id } },
          ids: [...state.ids, id],
        }));
        return id;
      },
      updateAsset: (id, asset) => {
        set((state) => {
          if (!state.assets[id]) return state;
          return {
            assets: { ...state.assets, [id]: { ...asset, id } },
          };
        });
      },
      removeAsset: (id) => {
        set((state) => {
          if (!state.assets[id]) return state;
          const rest = { ...state.assets };
          delete rest[id];
          return {
            assets: rest,
            ids: state.ids.filter((x) => x !== id),
          };
        });
      },
    }),
    {
      name: "comparador-renda-fixa::assets",
      partialize: (state) => ({ assets: state.assets, ids: state.ids }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const hydratedAssets = Object.fromEntries(
          Object.entries(state.assets).map(([id, asset]) => [
            id,
            {
              ...asset,
              applicationDate: new Date(asset.applicationDate),
              redemptionDate: new Date(asset.redemptionDate),
            },
          ]),
        );

        state.assets = hydratedAssets;
      },
    },
  ),
);
