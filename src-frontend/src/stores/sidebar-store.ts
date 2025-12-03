import { create } from "zustand";
import { persist } from "zustand/middleware";

export type View =
  | "tasks"
  | "workspaces"
  | "agents"
  | "toolsets"
  | "plugins"
  | "settings";

type SidebarState = {
  isOpen: boolean;
  activeView: View | null;
};

type SidebarActions = {
  openSidebar: (view?: View) => void;
  closeSidebar: () => void;
  toggleSidebar: (view?: View) => void;
};

type SidebarStore = SidebarState & SidebarActions;

const DEFAULT_VIEW: View = "tasks";

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set, get) => ({
      isOpen: false,
      activeView: null,
      toggleSidebar: (view: View | null = null) => {
        const { isOpen, activeView } = get();
        if (activeView !== null && view !== null && view !== activeView) {
          set({ isOpen: true, activeView: view });
          return;
        }
        set({
          isOpen: !isOpen,
          activeView: view ?? activeView ?? DEFAULT_VIEW,
        });
      },
      openSidebar: (view: View | null = null) => {
        const { activeView } = get();
        set({ isOpen: true, activeView: view ?? activeView ?? DEFAULT_VIEW });
      },
      closeSidebar: () => {
        set({ isOpen: false });
      },
    }),
    { name: "sidebar" }
  )
);
