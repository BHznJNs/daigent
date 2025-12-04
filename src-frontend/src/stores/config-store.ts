import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppConfig } from "../types/common";

type ConfigStore = {
  config: AppConfig;
  setPartialConfig: (partialConfig: Partial<AppConfig>) => void;
  restoreDefault: () => void;
};

const DEFAULT_CONFIG: AppConfig = {
  theme: "system",
  language: "en",
};

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      config: DEFAULT_CONFIG,
      setPartialConfig(partialConfig) {
        const current = get().config;
        set({ config: { ...current, ...partialConfig } });
      },
      restoreDefault() {
        set({ config: DEFAULT_CONFIG });
      },
    }),
    { name: "app-config" }
  )
);
