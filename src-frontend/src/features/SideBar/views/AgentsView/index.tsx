import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { Activity, useState } from "react";
import { fetchAgents } from "@/api/agent";
import { FailedToLoad } from "@/components/FailedToLoad";
import { Button } from "@/components/ui/button";
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
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_AGENT } from "@/constants/agent";
import type { AgentRead } from "@/types/agent";
import { SideBarHeader } from "../../SideBar";
import { AgentEdit } from "./components/AgentEdit";

type AgentItemProps = {
  agent: AgentRead;
  onClick?: () => void;
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

function AgentListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <Item
          key={`agent-skeleton-${Date.now()}-${index}`}
          variant="outline"
          size="sm"
        >
          <ItemMedia variant="icon">
            <Skeleton className="size-4" />
          </ItemMedia>
          <ItemContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </ItemContent>
        </Item>
      ))}
    </div>
  );
}

export function AgentsView() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["agents"],
    queryFn: () => fetchAgents(1, 20),
  });

  const content = (() => {
    if (isLoading) {
      return <AgentListSkeleton />;
    }
    if (isError) {
      return (
        <FailedToLoad
          refetch={refetch}
          description="无法加载 Agent 列表，请稍后重试。"
        />
      );
    }
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
  })();

  const handleCreateAgent = () => {
    setShowCreateForm(true);
  };

  return (
    <div className="flex h-full flex-col">
      <SideBarHeader
        title="Agents"
        actions={[
          {
            button: (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={handleCreateAgent}
              >
                <PlusIcon className="size-4" />
              </Button>
            ),
            tooltip: "Create new agent",
          },
        ]}
      />
      <div className="flex-1">
        {content}
        <Activity mode={showCreateForm ? "visible" : "hidden"}>
          <AgentEdit
            agent={DEFAULT_AGENT}
            onSuccess={() => setShowCreateForm(false)}
            onCancel={() => setShowCreateForm(false)}
          />
        </Activity>
      </div>
    </div>
  );
}
AgentsView.componentId = "agents";
