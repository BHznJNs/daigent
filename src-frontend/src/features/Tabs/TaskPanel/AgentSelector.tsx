import { ChevronsUpDownIcon } from "lucide-react";
import { SingleSelectDialog } from "@/components/custom/dialog/SingleSelectDialog";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { AgentRead } from "@/types/agent";

type AgentSelectorProps = {
  value: AgentRead | null;
  onValueChange: (agent: AgentRead | null) => void;
};

export function AgentSelector({ value, onValueChange }: AgentSelectorProps) {
  const { currentWorkspace, isLoading } = useWorkspaceStore();
  const agents = currentWorkspace?.usable_agents ?? [];

  return (
    <SingleSelectDialog
      value={value ?? undefined}
      selections={agents}
      getKey={(agent) => agent.id}
      getValue={(agent) => agent.name}
      onSelect={onValueChange}
      placeholder="Search agent..."
      emptyText={isLoading ? "Loading..." : "No agent found."}
    >
      <Button variant="outline" role="combobox" className="justify-between">
        {value ? value.name : "Select agent"}
        <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
      </Button>
    </SingleSelectDialog>
  );
}
