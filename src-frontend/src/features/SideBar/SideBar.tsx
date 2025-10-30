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
import { WorkspacesView } from "./views/WorkspacesView";

const viewComponents = {
  tasks: TasksView,
  workspaces: WorkspacesView,
  agents: AgentsView,
  plugins: PluginsView,
  settings: SettingsView,
};

type SideBarHeaderProps = {
  title: string;
  actions: { button: React.ReactNode; tooltip: string }[];
};

export function SideBarHeader(propts: SideBarHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b py-2 pr-3 pl-4">
      <span className="font-medium text-sm">{propts.title}</span>
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

  const ViewComponent = viewComponents[activeView];

  return (
    <div className="h-full bg-card">
      <ViewComponent />
    </div>
  );
}
