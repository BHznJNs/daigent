import { Store } from "@tauri-apps/plugin-store";
import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type AppConfig, AppConfigSchema } from "../types/common";

type ConfigStore = {
  config: AppConfig;
  syncConfig: () => Promise<void>;
  setPartialConfig: (partialConfig: Partial<AppConfig>) => Promise<void>;
  restoreDefault: () => Promise<void>;
};

const DEFAULT_CONFIG: AppConfig = {
  theme: "system",
  language: "en",
};

class TauriStore {
  static STORE_PATH = "config.json";
  private readonly store: Store;

  private constructor(store: Store) {
    this.store = store;
  }

  async getConfig(): Promise<AppConfig> {
    const rawConfig = Object.fromEntries(await this.store.entries());
    const result = AppConfigSchema.safeParse(rawConfig);
    if (result.success) {
      return result.data;
    }
    console.warn(
      "Config validation failed, returning default config.",
      result.error
    );
    return DEFAULT_CONFIG;
  }

  static async init(): Promise<TauriStore | null> {
    try {
      const store = await Store.load(TauriStore.STORE_PATH);
      const entries = await store.entries();
      const currentConfig = Object.fromEntries(entries);
      const configToSet = { ...DEFAULT_CONFIG, ...currentConfig };
      const tasks: Promise<void>[] = [];
      for (const [key, value] of Object.entries(configToSet)) {
        tasks.push(store.set(key, value));
      }
      await Promise.all(tasks);
      return new TauriStore(store);
    } catch (e) {
      console.error("Failed to initialize config store.", e);
      return null;
    }
  }

  async setPartialConfig(partialConfig: Partial<AppConfig>) {
    const tasks: Promise<void>[] = [];
    for (const [key, value] of Object.entries(partialConfig)) {
      tasks.push(this.store.set(key, value));
    }
    await Promise.all(tasks);
  }

  async restoreDefault() {
    await this.store.clear();
    const tasks: Promise<void>[] = [];
    for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
      tasks.push(this.store.set(key, value));
    }
    await Promise.all(tasks);
  }
}

const tauriStore = TauriStore.init();

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      config: DEFAULT_CONFIG,
      syncConfig: async () => {
        const store = await tauriStore;
        if (!store) {
          toast.error("Failed to initialize config store.");
          return;
        }
        set({ config: await store.getConfig() });
      },
      setPartialConfig: async (partialConfig) => {
        const store = await tauriStore;
        if (!store) {
          toast.error("Failed to initialize config store.");
          return;
        }
        await store.setPartialConfig(partialConfig);
        const current = get().config;
        set({ config: { ...current, ...partialConfig } });
      },
      restoreDefault: async () => {
        const store = await tauriStore;
        if (!store) {
          toast.error("Failed to initialize config store.");
          return;
        }
        await store.restoreDefault();
        set({ config: DEFAULT_CONFIG });
      },
    }),
    { name: "app-config" }
  )
);
