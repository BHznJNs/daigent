import { useEffect, useRef, useState } from "react";
import type { Panel } from "react-resizable-panels";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useConfigStore } from "@/stores/config-store";
import { applyTheme } from "@/utils/applyTheme";
import { ActivityBar } from "./features/ActivityBar/ActivityBar";
import { SideBar } from "./features/SideBar/SideBar";
import { Tabs } from "./features/Tabs/Tabs";
import { cn } from "./lib/utils";
import { useSidebarStore } from "./stores/sidebar-store";
import { useTabsStore } from "./stores/tabs-store";

function Layout() {
  const DEFAULT_SIDEBAR_SIZE = 40;
  const { addTab } = useTabsStore();
  const { isOpen, openSidebar, closeSidebar } = useSidebarStore();
  const [isDragging, setIsDragging] = useState(false);
  const sideBarPanelRef = useRef<React.ElementRef<typeof Panel>>(null);

  useEffect(() => {
    for (let i = 1; i <= 10; i++) {
      addTab({ id: `tab-${i}`, title: `Tab ${i}` });
    }
  }, [addTab]);

  useEffect(() => {
    if (isOpen) {
      sideBarPanelRef.current?.expand();
    } else {
      sideBarPanelRef.current?.collapse();
    }
  }, [isOpen]);

  return (
    <div className="flex h-full">
      <ActivityBar />
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel
          ref={sideBarPanelRef}
          defaultSize={isOpen ? DEFAULT_SIDEBAR_SIZE : 0}
          minSize={20}
          maxSize={80}
          collapsible={true}
          collapsedSize={0}
          className={cn(
            !isDragging && "transition-all duration-300 ease-in-out"
          )}
          onCollapse={closeSidebar}
          onExpand={openSidebar}
        >
          <SideBar />
        </ResizablePanel>
        <ResizableHandle onDragging={setIsDragging} />
        <ResizablePanel defaultSize={60} minSize={20}>
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
