import {
  BotMessageSquareIcon,
  LayoutListIcon,
  PlugIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSidebarStore, type View } from "@/stores/sidebar-store";

const topViews: { id: View; title: string; icon: React.ReactNode }[] = [
  {
    id: "tasks",
    title: "Tasks",
    icon: <LayoutListIcon className="size-5" />,
  },
  {
    id: "workspaces",
    title: "Workspaces",
    icon: <UsersIcon className="size-5" />,
  },
  {
    id: "agents",
    title: "Agents",
    icon: <BotMessageSquareIcon className="size-5" />,
  },
  {
    id: "plugins",
    title: "Plugins",
    icon: <PlugIcon className="size-5" />,
  },
];

const bottomViews: { id: View; title: string; icon: React.ReactNode }[] = [
  {
    id: "settings",
    title: "Settings",
    icon: <SettingsIcon className="size-5" />,
  },
];

export function ActivityBar() {
  const { activeView, toggleSidebar } = useSidebarStore();

  return (
    <div className="flex flex-col justify-between border-r bg-card p-2">
      <div className="flex flex-col items-center gap-2">
        {topViews.map(({ id, title, icon }) => (
          <Tooltip key={id} delayDuration={700}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-lg",
                  activeView === id && "bg-muted text-foreground"
                )}
                onClick={() => toggleSidebar(id)}
              >
                {icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={5}>
              {title}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      <div className="flex flex-col items-center gap-2">
        {bottomViews.map(({ id, title, icon }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-lg",
                  activeView === id && "bg-muted text-foreground"
                )}
                onClick={() => toggleSidebar(id)}
              >
                {icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={5}>
              {title}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
