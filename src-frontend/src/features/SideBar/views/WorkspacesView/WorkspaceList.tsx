import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { FolderIcon, PencilIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { deleteWorkspace, fetchWorkspaces } from "@/api/workspace";
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
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { tabIdFactory } from "@/lib/tab";
import { useTabsStore } from "@/stores/tabs-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { Tab, WorkspaceTabMetadata } from "@/types/tab";
import type { WorkspaceRead } from "@/types/workspace";

function createWorkspaceEditTab(
  workspaceId: number,
  workspaceName: string
): Tab {
  return {
    id: tabIdFactory(),
    type: "workspace",
    title: `编辑：${workspaceName}`,
    icon: "folder-cog",
    metadata: { mode: "edit", id: workspaceId },
  };
}

type OpenWorkspaceEditTabParams = {
  tabs: Tab[];
  workspaceId: number;
  workspaceName: string;
  addTab: (tab: Tab) => void;
  setActiveTab: (tabId: string) => void;
};

function openWorkspaceEditTab({
  tabs,
  workspaceId,
  workspaceName,
  addTab,
  setActiveTab,
}: OpenWorkspaceEditTabParams) {
  // 检查是否已存在该工作区的编辑 tab
  const existingTab = tabs.find(
    (tab) =>
      tab.type === "workspace" &&
      tab.metadata.mode === "edit" &&
      (tab.metadata as WorkspaceTabMetadata & { mode: "edit" }).id ===
        workspaceId
  );

  if (existingTab) {
    // 如果已存在，激活该 tab
    setActiveTab(existingTab.id);
  } else {
    // 如果不存在，创建新 tab
    const newTab = createWorkspaceEditTab(workspaceId, workspaceName);
    addTab(newTab);
  }
}

type WorkspaceItemProps = {
  workspace: WorkspaceRead;
  disabled: boolean;
  isSelected: boolean;
  onSelect: (workspaceId: number) => void;
};

export function WorkspaceListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <Item
          key={`workspace-skeleton-${Date.now()}-${index}`}
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

function WorkspaceItem({
  workspace,
  disabled,
  isSelected,
  onSelect,
}: WorkspaceItemProps) {
  const queryClient = useQueryClient();
  const { tabs, addTab, setActiveTab, removeTab } = useTabsStore();
  const { currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();

  const handleSelect = (e: React.MouseEvent) => {
    if (disabled) {
      return;
    }
    onSelect(workspace.id);
    e.stopPropagation();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    openWorkspaceEditTab({
      tabs,
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      addTab,
      setActiveTab,
    });
  };

  const deleteWorkspaceMutation = useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: async (_data, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });

      const tabsToRemove = tabs.filter(
        (tab) =>
          tab.type === "workspace" &&
          tab.metadata.mode === "edit" &&
          tab.metadata.id === deletedId
      );

      for (const tab of tabsToRemove) {
        removeTab(tab.id);
      }

      toast.success("删除成功", {
        description: "已成功删除工作区。",
      });

      // clear current workspace if deleted
      if (deletedId === currentWorkspace?.id) {
        await setCurrentWorkspace(null);
      }
    },
    onError: (error: Error) => {
      toast.error("删除失败", {
        description: error.message || "删除工作区时发生错误，请稍后重试。",
      });
    },
  });

  const handleDeleteConfirm = () => {
    deleteWorkspaceMutation.mutate(workspace.id);
  };

  return (
    <Item
      variant="outline"
      size="sm"
      className="flex cursor-default flex-nowrap rounded-none border-t-0 border-r-0 border-l-0 hover:bg-accent/30"
    >
      <ItemMedia
        variant="icon"
        role="button"
        className={
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        }
        onClick={handleSelect}
        aria-disabled={disabled}
      >
        <FolderIcon
          fill={isSelected ? "currentColor" : "none"}
          className="size-4"
        />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{workspace.name}</ItemTitle>
        <ItemDescription>{workspace.directory}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={handleEdit}
          title="编辑工作区"
        >
          <PencilIcon className="size-4" />
        </Button>
        <ConfirmDeleteDialog
          description={`确定要删除工作区"${workspace.name}"吗？此操作无法撤销。`}
          onConfirm={handleDeleteConfirm}
          isDeleting={deleteWorkspaceMutation.isPending}
        >
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            title="删除工作区"
            disabled={deleteWorkspaceMutation.isPending}
            onClick={(e) => e.stopPropagation()}
          >
            <TrashIcon className="size-4" />
          </Button>
        </ConfirmDeleteDialog>
      </ItemActions>
    </Item>
  );
}

export function WorkspaceList() {
  const {
    currentWorkspace,
    setCurrentWorkspace,
    isLoading: isCurrentWorkspaceSetting,
  } = useWorkspaceStore();

  const { data } = useSuspenseQuery({
    queryKey: ["workspaces"],
    queryFn: async () => await fetchWorkspaces(1, 20),
  });

  if (data?.items.length === 0) {
    return (
      <Empty>
        <EmptyContent>
          <EmptyTitle>暂无工作区</EmptyTitle>
          <EmptyDescription>您还没有创建任何工作区。</EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <ScrollArea className="flex-1">
      {data?.items.map((workspace) => (
        <WorkspaceItem
          key={workspace.id}
          workspace={workspace}
          disabled={isCurrentWorkspaceSetting}
          isSelected={workspace.id === currentWorkspace?.id}
          onSelect={setCurrentWorkspace}
        />
      ))}
    </ScrollArea>
  );
}
