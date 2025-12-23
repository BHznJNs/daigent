import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { fetchAgents } from "@/api/agent";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AgentRead } from "@/types/agent";
import { AgentEdit } from "./AgentEdit";

type AgentItemProps = {
  agent: AgentRead;
};

function AgentItem({ agent }: AgentItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const handleUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["agents"] });
    setIsOpen(false);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Item
          variant="outline"
          size="sm"
          className="flex cursor-pointer flex-nowrap rounded-none border-t-0 border-r-0 border-l-0 hover:bg-accent/30"
        >
          {/* TODO: add agent icon and agent icon selecting feature */}
          <ItemContent>
            <ItemTitle>{agent.name}</ItemTitle>
            <ItemDescription>
              {agent.model ? agent.model.name : "未关联模型"}
            </ItemDescription>
          </ItemContent>
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </Item>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <AgentEdit
          agent={agent}
          onSuccess={handleUpdated}
          onCancel={() => setIsOpen(false)}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AgentList() {
  const { data } = useSuspenseQuery({
    queryKey: ["agents"],
    queryFn: async () => await fetchAgents(1, 20),
  });

  if (data?.items === undefined || data.items.length === 0) {
    return (
      <Empty>
        <EmptyContent>
          <EmptyTitle>暂无 Agent</EmptyTitle>
          <EmptyDescription>您还没有创建任何 Agent。</EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <ScrollArea className="flex-1">
      {data?.items.map((agent) => (
        <AgentItem key={agent.id} agent={agent} />
      ))}
    </ScrollArea>
  );
}
