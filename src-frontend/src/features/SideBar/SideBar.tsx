import { Activity } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebarStore } from "@/stores/sidebar-store";
import { AgentsView } from "./views/AgentsView";
import { PluginsView } from "./views/PluginsView";
import { SettingsView } from "./views/SettingsView";
import { TasksView } from "./views/TasksView";
import { ToolsetsView } from "./views/ToolsetsView";
import { WorkspacesView } from "./views/WorkspacesView";

type SideBarHeaderProps = {
  title: string;
  actions: { button: React.ReactNode; tooltip: string }[];
};

/**
 * @description It's recommended to set the passed in Button size to `h-8`.
 */
export function SideBarHeader(propts: SideBarHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b py-2 pr-3 pl-4">
      <span className="h-8 font-medium text-sm leading-8">{propts.title}</span>
      <div className="flex gap-2">
        {propts.actions.map(({ button, tooltip }, index) => (
          <Tooltip key={index} delayDuration={600}>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}

export function SideBar() {
  const { activeView } = useSidebarStore();

  if (!activeView) {
    return null;
  }

  return (
    <div className="h-full bg-muted/40">
      {[
        TasksView,
        WorkspacesView,
        AgentsView,
        ToolsetsView,
        PluginsView,
        SettingsView,
      ].map((Component) => (
        <Activity
          key={Component.componentId}
          mode={activeView === Component.componentId ? "visible" : "hidden"}
        >
          <Component />
        </Activity>
      ))}
    </div>
  );
}
