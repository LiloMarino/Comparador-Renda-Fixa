import { create } from "zustand";
import { persist } from "zustand/middleware";
import { selicToCdi } from "@/lib/cdi";

type SettingsState = {
  selic: number;
  selicUpdatedAt: string;
  setSelic: (value: number) => void;
  globalAmountCents: number | null;
  globalApplicationDate: string | null;
  setGlobalAmountCents: (value: number | null) => void;
  setGlobalApplicationDate: (value: string | null) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      selic: 14.5,
      selicUpdatedAt: "",
      setSelic: (value) =>
        set({
          selic: value,
          selicUpdatedAt: new Date().toISOString(),
        }),
      globalAmountCents: null,
      globalApplicationDate: null,
      setGlobalAmountCents: (value) => set({ globalAmountCents: value }),
      setGlobalApplicationDate: (value) => set({ globalApplicationDate: value }),
    }),
    {
      name: "comparador-renda-fixa::settings",
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

export function useGlobalAmountCents(): number | null {
  return useSettingsStore((s) => s.globalAmountCents);
}

export function useGlobalApplicationDate(): string | null {
  return useSettingsStore((s) => s.globalApplicationDate);
}
