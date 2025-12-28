import { useEffect, useRef } from "react";
import {
  type PanelSize,
  useDefaultLayout,
  useGroupRef,
  usePanelRef,
} from "react-resizable-panels";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { applyTheme } from "@/lib/applyTheme";
import { useConfigStore } from "@/stores/config-store";
import { ActivityBar } from "./features/ActivityBar/ActivityBar";
import { SideBar } from "./features/SideBar/SideBar";
import { Tabs } from "./features/Tabs";
import { useSidebarStore } from "./stores/sidebar-store";

function Layout() {
  const { defaultLayout, onLayoutChange } = useDefaultLayout({
    id: "panels",
    storage: localStorage,
  });

  const { isOpen, openSidebar, closeSidebar } = useSidebarStore();
  const recentPanelSizePx = useRef(0);
  const groupRef = useGroupRef();
  const sideBarPanelRef = usePanelRef();

  const handleSideBarResize = (
    panelSize: PanelSize,
    _: string | number | undefined
  ) => {
    if (panelSize.asPercentage === 0) {
      closeSidebar();
    } else {
      openSidebar();
      recentPanelSizePx.current = panelSize.inPixels;
    }
  };

  useEffect(() => {
    if (groupRef.current === null || sideBarPanelRef.current === null) {
      return;
    }
    try {
      if (isOpen) {
        sideBarPanelRef.current.resize(recentPanelSizePx.current);
      } else {
        sideBarPanelRef.current.collapse();
      }
    } catch (e) {
      console.warn(e);
    }
  }, [isOpen]);

  return (
    <div className="flex h-full">
      <ActivityBar />
      <ResizablePanelGroup
        className="h-full"
        orientation="horizontal"
        groupRef={groupRef}
        onLayoutChange={onLayoutChange}
        defaultLayout={defaultLayout}
      >
        <ResizablePanel
          panelRef={sideBarPanelRef}
          minSize={200}
          maxSize={"75%"}
          collapsible
          onResize={handleSideBarResize}
        >
          <SideBar />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel minSize={20}>
          <Tabs />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

function App() {
  const { config } = useConfigStore();
  const { theme } = config;

  useEffect(() => applyTheme(theme), [theme]);

  return <Layout />;
}

export default App;
