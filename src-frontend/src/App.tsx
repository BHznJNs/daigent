import { useEffect } from "react";
import { DynamicTabs } from "@/components/DynamicTabs";
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useConfigStore } from "@/stores/config-store";
import { applyTheme } from "@/utils/applyTheme";

function App() {
  const { config } = useConfigStore();
  const { theme } = config;

  useEffect(() => applyTheme(theme), [theme]);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>{/* 侧边栏内容将在这里添加 */}</SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <span className="font-semibold">Daigent</span>
          </div>
        </header>
        <main className="flex flex-1 flex-col overflow-hidden">
          <DynamicTabs />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
