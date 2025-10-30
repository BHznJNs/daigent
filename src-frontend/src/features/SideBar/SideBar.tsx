import { useSidebarStore } from "@/stores/sidebar-store";

function TasksView() {
  return <div>Tasks View</div>;
}

function WorkspacesView() {
  return <div>Workspaces View</div>;
}

function AgentsView() {
  return <div>Agents View</div>;
}

function PluginsView() {
  return <div>Plugins View</div>;
}

function SettingsView() {
  return <div>Settings View</div>;
}

const viewComponents = {
  tasks: TasksView,
  workspaces: WorkspacesView,
  agents: AgentsView,
  plugins: PluginsView,
  settings: SettingsView,
};

export function SideBar() {
  const { activeView } = useSidebarStore();

  if (!activeView) {
    return null;
  }

  const ViewComponent = viewComponents[activeView];

  return (
    <div className="h-full bg-card p-4 text-card-foreground">
      <ViewComponent />
    </div>
  );
}
