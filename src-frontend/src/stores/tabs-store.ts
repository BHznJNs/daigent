import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Tab } from "@/types/tab";

type TabsState = {
  tabs: Tab[];
  activeTabId: string | null;
};

type TabsActions = {
  addTab: (tab: Tab) => void;
  setActiveTab: (tabId: string) => void;
  setTabs: (tabs: Tab[]) => void;
  updateTab: (tab: Tab) => void;
  removeTab: (tabId: string) => void;
};

type TabsStore = TabsState & TabsActions;

export const useTabsStore = create<TabsStore>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,
      setTabs(tabs) {
        const currentActive = get().activeTabId;
        const activeStillExists = tabs.some((t) => t.id === currentActive);
        set({
          tabs,
          activeTabId: activeStillExists
            ? currentActive
            : (tabs[0]?.id ?? null),
        });
      },
      addTab(tab) {
        set((state) => {
          const exists = state.tabs.some((t) => t.id === tab.id);
          if (exists) {
            return {
              activeTabId: tab.id,
            };
          }
          return {
            tabs: [...state.tabs, tab],
            activeTabId: tab.id,
          };
        });
      },
      setActiveTab(tabId) {
        set((state) => {
          const exists = state.tabs.some((t) => t.id === tabId);
          if (!exists) {
            return {};
          }
          return { activeTabId: tabId };
        });
      },
      updateTab(tab) {
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === tab.id ? tab : t)),
        }));
      },
      removeTab(tabId) {
        set((state) => {
          const idx = state.tabs.findIndex((t) => t.id === tabId);
          if (idx === -1) {
            // passed in tabId does not exist
            return {};
          }

          const newTabs = state.tabs.filter((tab) => tab.id !== tabId);

          if (state.activeTabId !== tabId) {
            return { tabs: newTabs };
          }

          if (newTabs.length === 0) {
            return {
              tabs: newTabs,
              activeTabId: null,
            };
          }

          const hasRightTab = idx < newTabs.length;
          const newActiveTabId = hasRightTab
            ? newTabs[idx].id
            : newTabs[idx - 1].id;

          return {
            tabs: newTabs,
            activeTabId: newActiveTabId,
          };
        });
      },
    }),
    { name: "tabs" }
  )
);
