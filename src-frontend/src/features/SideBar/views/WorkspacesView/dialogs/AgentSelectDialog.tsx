import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import type { AgentPaginatedResponse } from "@/api/agent";
import { fetchAgents } from "@/api/agent";
import { FailedToLoad } from "@/components/FailedToLoad";
import { SelectionItem } from "@/components/SelectionItem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty";
import InfiniteScroll from "@/components/ui/infinite-scroll";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { AgentRead } from "@/types/agent";

type AgentSelectDialogProps = {
  children: React.ReactNode;
  existingAgents: AgentRead[];
  onCancel?: () => void;
  onConfirm?: (selectedAgents: AgentRead[]) => void;
};

function AgentSelectSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AgentSelectDialog({
  children,
  existingAgents: existingAgentArr,
  onCancel,
  onConfirm,
}: AgentSelectDialogProps) {
  const existingAgentIds = useRef<Set<number>>(new Set());
  const selectedAgentIds = useRef<Set<number>>(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<AgentRead[]>([]);

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<AgentPaginatedResponse>({
    queryKey: ["agents"],
    queryFn: ({ pageParam = 1 }) => fetchAgents(pageParam as number),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return;
    },
    initialPageParam: 1,
    enabled: isOpen,
  });

  const allAgents = data?.pages.flatMap((page) => page.items) ?? [];

  useEffect(() => {
    if (isOpen) {
      existingAgentIds.current.clear();
      selectedAgentIds.current.clear();
      refetch();
    }
  }, [isOpen]);

  useEffect(() => {
    if (allAgents && allAgents.length > 0) {
      existingAgentIds.current = new Set(existingAgentArr.map((a) => a.id));
      selectedAgentIds.current = structuredClone(existingAgentIds.current);

      const selectedAgentArr: AgentRead[] = [];
      for (const agent of allAgents) {
        if (existingAgentIds.current.has(agent.id)) {
          selectedAgentArr.push(agent);
        }
      }
      setSelectedAgents(selectedAgentArr);
    }
  }, [data]);

  const handleToggleAgent = (agentId: number) => {
    const isSelected = selectedAgentIds.current.has(agentId);
    if (isSelected) {
      selectedAgentIds.current.delete(agentId);
      setSelectedAgents(selectedAgents.filter((agent) => agent.id !== agentId));
    } else {
      selectedAgentIds.current.add(agentId);
      const targetAgent = allAgents.find((agent) => agent.id === agentId);
      if (targetAgent) {
        setSelectedAgents([...selectedAgents, targetAgent]);
      }
    }
  };

  const handleConfirm = () => {
    onConfirm?.(selectedAgents);
    setSelectedAgents([]);
    setIsOpen(false);
  };

  const content = (() => {
    if (isLoading && allAgents.length === 0) {
      return <AgentSelectSkeleton />;
    }

    if (isError) {
      return (
        <FailedToLoad
          refetch={() => refetch()}
          description="无法获取 Agent 列表，请稍后重试。"
        />
      );
    }

    if (allAgents.length === 0) {
      return (
        <Empty>
          <EmptyContent>
            <EmptyTitle>暂无可用 Agent</EmptyTitle>
            <EmptyDescription>当前没有可用的 Agent。</EmptyDescription>
          </EmptyContent>
        </Empty>
      );
    }

    return (
      <div className="space-y-3">
        <InfiniteScroll
          isLoading={isFetchingNextPage}
          hasMore={hasNextPage ?? false}
          next={() => fetchNextPage()}
        >
          {allAgents.map((agent) => {
            const isSelected = selectedAgentIds.current.has(agent.id);

            return (
              <SelectionItem
                key={agent.id}
                value={agent.id}
                label={agent.name}
                isSelected={isSelected}
                handleToggle={handleToggleAgent}
              />
            );
          })}
        </InfiniteScroll>
        {isFetchingNextPage && <AgentSelectSkeleton />}
      </div>
    );
  })();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex flex-col sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>选择可用 Agent</DialogTitle>
        </DialogHeader>

        <p className="mb-4 text-muted-foreground text-sm">
          从可用 Agent 中选择需要添加的 Agent：
        </p>

        <ScrollArea className="mr-[-5px] h-[60vh] pr-[5px]">
          {content}
        </ScrollArea>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button onClick={onCancel} variant="outline">
              取消
            </Button>
          </DialogClose>
          <Button
            onClick={handleConfirm}
            disabled={selectedAgents.length === 0}
          >
            确认添加 ({selectedAgents.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
