import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Asset,
  AssetWithId,
} from "@/features/comparator/schemas/asset-schema";

type AssetsState = {
  assets: AssetWithId[];
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
      assets: [],
      addAsset: (asset) => {
        const id = generateId();
        set((state) => ({
          assets: [...state.assets, { ...asset, id }],
        }));
        return id;
      },
      updateAsset: (id, asset) => {
        set((state) => ({
          assets: state.assets.map((a) => (a.id === id ? { ...asset, id } : a)),
        }));
      },
      removeAsset: (id) => {
        set((state) => ({
          assets: state.assets.filter((a) => a.id !== id),
        }));
      },
    }),
    {
      name: "comparador-renda-fixa::assets",
      version: 1,
      partialize: (state) => ({ assets: state.assets }),
      migrate: (persistedState, version) => {
        const state = (persistedState ?? { assets: [] }) as {
          assets: AssetWithId[];
        };
        if (version < 1) {
          state.assets = state.assets.map((asset, i) => ({
            ...asset,
            name: asset.name ?? `Investimento #${i + 1}`,
          }));
        }
        return state;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.assets = state.assets.map((asset) => ({
          ...asset,
          applicationDate: new Date(asset.applicationDate),
          redemptionDate: new Date(asset.redemptionDate),
        }));
      },
    },
  ),
);
