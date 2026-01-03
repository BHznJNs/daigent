import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { PencilIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { deleteAgent, fetchAgents } from "@/api/agent";
import { ConfirmDeleteDialog } from "@/components/custom/dialog/ConfirmDeteteDialog";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { tabIdFactory } from "@/lib/tab";
import { useTabsStore } from "@/stores/tabs-store";
import type { AgentRead } from "@/types/agent";
import type { AgentTabMetadata, Tab } from "@/types/tab";
import { AgentAvatar } from "./AgentAvatar";

function createAgentEditTab(agentId: number, agentName: string): Tab {
  return {
    id: tabIdFactory(),
    type: "agent",
    title: `编辑：${agentName}`,
    icon: "bot",
    metadata: { mode: "edit", id: agentId },
  };
}

type OpenAgentEditTabParams = {
  tabs: Tab[];
  agentId: number;
  agentName: string;
  addTab: (tab: Tab) => void;
  setActiveTab: (tabId: string) => void;
};

function openAgentEditTab({
  tabs,
  agentId,
  agentName,
  addTab,
  setActiveTab,
}: OpenAgentEditTabParams) {
  const existingTab = tabs.find(
    (tab) =>
      tab.type === "agent" &&
      tab.metadata.mode === "edit" &&
      (tab.metadata as AgentTabMetadata & { mode: "edit" }).id === agentId
  );

  if (existingTab) {
    setActiveTab(existingTab.id);
  } else {
    const newTab = createAgentEditTab(agentId, agentName);
    addTab(newTab);
  }
}

type AgentItemProps = {
  agent: AgentRead;
};

function AgentItem({ agent }: AgentItemProps) {
  const queryClient = useQueryClient();
  const { tabs, addTab, setActiveTab, removeTab } = useTabsStore();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    openAgentEditTab({
      tabs,
      agentId: agent.id,
      agentName: agent.name,
      addTab,
      setActiveTab,
    });
  };

  const deleteAgentMutation = useMutation({
    mutationFn: deleteAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });

      const tabsToRemove = tabs.filter(
        (tab) =>
          tab.type === "agent" &&
          tab.metadata.mode === "edit" &&
          tab.metadata.id === agent.id
      );

      for (const tab of tabsToRemove) {
        removeTab(tab.id);
      }

      toast.success("删除成功", {
        description: "已成功删除 Agent。",
      });
    },
    onError: (error: Error) => {
      toast.error("删除失败", {
        description: error.message || "删除 Agent 时发生错误，请稍后重试。",
      });
    },
  });

  const handleDeleteConfirm = () => {
    deleteAgentMutation.mutate(agent.id);
  };

  return (
    <Item
      variant="outline"
      size="sm"
      className="flex cursor-default flex-nowrap rounded-none border-t-0 border-r-0 border-l-0 hover:bg-accent/30"
    >
      <AgentAvatar name={agent.name} iconName={agent.icon_name} size={18} />

      <ItemContent>
        <ItemTitle>{agent.name}</ItemTitle>
        <ItemDescription>
          {agent.model ? agent.model.name : "未关联模型"}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={handleEdit}
          title="编辑 Agent"
        >
          <PencilIcon className="size-4" />
        </Button>
        <ConfirmDeleteDialog
          description={`确定要删除 Agent "${agent.name}" 吗？此操作无法撤销。`}
          onConfirm={handleDeleteConfirm}
          isDeleting={deleteAgentMutation.isPending}
        >
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            title="删除 Agent"
            disabled={deleteAgentMutation.isPending}
            onClick={(e) => e.stopPropagation()}
          >
            <TrashIcon className="size-4" />
          </Button>
        </ConfirmDeleteDialog>
      </ItemActions>
    </Item>
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
