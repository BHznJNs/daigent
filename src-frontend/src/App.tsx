import { useEffect } from "react";
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
import { useSidebarStore } from "./stores/sidebar-store";
import { useTabsStore } from "./stores/tabs-store";

function Layout() {
  const { addTab } = useTabsStore();
  const { isOpen } = useSidebarStore();

  const SIDEBAR_MIN_SIZE = 20;
  const SIDEBAR_MAX_SIZE = 75;
  const SIDEBAR_DEFAULT_SIZE = 25;

  useEffect(() => {
    for (let i = 1; i <= 10; i++) {
      addTab({ id: `tab-${i}`, title: `Tab ${i}` });
    }
  }, [addTab]);

  return (
    <div className="flex h-full">
      <ActivityBar />
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel
          defaultSize={SIDEBAR_DEFAULT_SIZE}
          minSize={isOpen ? SIDEBAR_MIN_SIZE : 0}
          maxSize={isOpen ? SIDEBAR_MAX_SIZE : 0}
          className="transition-all duration-300 ease-in-out"
        >
          <SideBar />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={75} minSize={25}>
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
