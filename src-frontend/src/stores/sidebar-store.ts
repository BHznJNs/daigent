import { create } from "zustand";

export type View = "tasks" | "workspaces" | "agents" | "plugins" | "settings";

type SidebarState = {
  isOpen: boolean;
  activeView: View | null;
};

type SidebarActions = {
  toggleSidebar: (view: View) => void;
  closeSidebar: () => void;
};

type SidebarStore = SidebarState & SidebarActions;

export const useSidebarStore = create<SidebarStore>((set, get) => ({
  isOpen: false,
  activeView: null,
  toggleSidebar: (view: View) => {
    const { isOpen, activeView } = get();
    if (isOpen && activeView === view) {
      set({ isOpen: false, activeView: null });
    } else {
      set({ isOpen: true, activeView: view });
    }
  },
  closeSidebar: () => {
    set({ isOpen: false, activeView: null });
  },
}));
