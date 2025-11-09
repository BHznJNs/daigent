import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Tab = {
  id: string;
  title: string;
};

type TabsState = {
  tabs: Tab[];
  activeTabId: string | null;
};

type TabsActions = {
  addTab: (tab: Tab) => void;
  setActiveTab: (tabId: string) => void;
  setTabs: (tabs: Tab[]) => void;
  removeTab: (tabId: string) => void;
};

type TabsStore = TabsState & TabsActions;

export const useTabsStore = create<TabsStore>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,
      setTabs(tabs) {
        set({ tabs });
      },
      addTab(tab) {
        const { tabs } = get();
        if (tabs.find((t) => t.id === tab.id)) {
          set({ activeTabId: tab.id });
          return;
        }
        set((state) => ({
          tabs: [...state.tabs, tab],
          activeTabId: tab.id,
        }));
      },
      setActiveTab(tabId) {
        set({ activeTabId: tabId });
      },
      removeTab(tabId) {
        set((state) => {
          const newTabs = state.tabs.filter((tab) => tab.id !== tabId);
          let newActiveTabId = state.activeTabId;

          if (state.activeTabId === tabId) {
            const closingTabIndex = state.tabs.findIndex(
              (tab) => tab.id === tabId
            );
            if (newTabs.length > 0) {
              newActiveTabId = newTabs[Math.max(0, closingTabIndex - 1)].id;
            } else {
              newActiveTabId = null;
            }
          }

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
