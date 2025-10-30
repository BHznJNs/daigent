import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SideBarHeader } from "../SideBar";

export function WorkspacesView() {
  return (
    <div className="flex h-full flex-col">
      <SideBarHeader
        title="Workspaces"
        actions={[
          {
            button: (
              <Button variant="ghost" size="icon" className="size-8">
                <PlusIcon className="size-4" />
              </Button>
            ),
            tooltip: "Create new workspace",
          },
        ]}
      />
      <div className="flex-1">{/* Placeholder for workspace list */}</div>
    </div>
  );
}
