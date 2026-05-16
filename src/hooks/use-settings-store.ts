import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { selicToCdi } from "@/lib/cdi";

type SettingsState = {
  selic: number;
  selicUpdatedAt: string;
  setSelic: (value: number) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      selic: 14.5,
      selicUpdatedAt: new Date().toISOString(),
      setSelic: (value) =>
        set({ selic: value, selicUpdatedAt: new Date().toISOString() }),
    }),
    {
      name: "comparador-renda-fixa::settings",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function useSelic(): number {
  return useSettingsStore((s) => s.selic);
}

export function useCdi(): number {
  return useSettingsStore((s) => selicToCdi(s.selic));
}

export function useSelicUpdatedAt(): string {
  return useSettingsStore((s) => s.selicUpdatedAt);
}
