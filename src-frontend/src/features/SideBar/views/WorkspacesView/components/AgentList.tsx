import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Item, ItemContent, ItemTitle } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import type { AgentRead } from "@/types/agent";
import { AgentSelectDialog } from "../dialogs/AgentSelectDialog";

type AgentListProps = {
  agents: AgentRead[];
  onChange: (agents: AgentRead[]) => void;
};

export function AgentList({ agents, onChange }: AgentListProps) {
  const [showAgentDialog, setShowAgentDialog] = useState(false);
  return (
    <>
      <div className="flex flex-col">
        <div className="flex justify-between">
          <Label>可用 Agent</Label>
          <Button
            type="button"
            onClick={() => setShowAgentDialog(true)}
            variant="outline"
          >
            选择
          </Button>
        </div>
        <div className="mt-2 space-y-2">
          {agents.map(({ name, id }) => (
            <Item key={id} variant="outline" size="sm">
              <ItemContent>
                <ItemTitle>{name}</ItemTitle>
              </ItemContent>
            </Item>
          ))}
        </div>
      </div>
      <AgentSelectDialog
        isOpen={showAgentDialog}
        existingAgents={agents}
        onClose={() => setShowAgentDialog(false)}
        onConfirm={onChange}
      />
    </>
  );
}
