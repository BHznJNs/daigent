import { useQuery } from "@tanstack/react-query";
import { ChevronDownIcon, FolderIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { fetchWorkspaces } from "@/api/workspace";
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
import { DEFAULT_WORKSPACE } from "@/constants/workspace";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { WorkspaceRead } from "@/types/workspace";
import { SideBarHeader } from "../../SideBar";
import { WorkspaceEdit } from "./components/WorkspaceEdit";
import { WorkspaceListSkeleton } from "./components/WorkspaceListSkeleton";

type WorkspaceItemProps = {
  workspace: WorkspaceRead;
  disabled: boolean;
  isSelected: boolean;
  onSelect: (workspaceId: number) => void;
};

function WorkspaceItem({
  workspace,
  disabled,
  isSelected,
  onSelect,
}: WorkspaceItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();

  const handleSelect = (e: React.MouseEvent) => {
    if (disabled) {
      return;
    }
    onSelect(workspace.id);
    e.stopPropagation();
  };

  const handleToggleEdit = () => {
    setIsOpen(!isOpen);
  };

  const handleDelete = async () => {
    if (workspace.id === currentWorkspace?.id) {
      await setCurrentWorkspace(null);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} disabled={disabled}>
      <Item
        variant="outline"
        size="sm"
        className="flex cursor-pointer flex-nowrap rounded-none border-t-0 border-r-0 border-l-0 hover:bg-accent/30"
        onClick={handleToggleEdit}
      >
        <ItemMedia
          variant="icon"
          role="button"
          className={disabled ? "cursor-not-allowed opacity-50" : ""}
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
        <CollapsibleTrigger asChild>
          <ChevronDownIcon
            className={`h-4 w-4 cursor-pointer rounded transition-transform hover:bg-accent/50 ${isOpen ? "rotate-180" : ""}`}
          />
        </CollapsibleTrigger>
      </Item>
      <CollapsibleContent>
        <WorkspaceEdit
          workspace={workspace}
          onConfirm={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
          onDelete={handleDelete}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}

export function WorkspacesView() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const {
    currentWorkspace,
    setCurrentWorkspace,
    isLoading: isCurrentWorkspaceSetting,
  } = useWorkspaceStore();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => fetchWorkspaces(1, 20),
  });

  const handleSelectWorkspace = async (workspaceId: number) => {
    await setCurrentWorkspace(workspaceId);
  };

  const content = (() => {
    if (isLoading) {
      return <WorkspaceListSkeleton />;
    }
    if (isError) {
      return (
        <FailedToLoad
          refetch={refetch}
          description="无法加载工作区列表，请稍后重试。"
        />
      );
    }
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
            onSelect={handleSelectWorkspace}
          />
        ))}
      </ScrollArea>
    );
  })();

  const handleCreateWorkspace = () => {
    setShowCreateForm(true);
  };

  return (
    <div className="flex h-full flex-col">
      <SideBarHeader
        title="Workspaces"
        actions={[
          {
            button: (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={handleCreateWorkspace}
              >
                <PlusIcon className="size-4" />
              </Button>
            ),
            tooltip: "Create new workspace",
          },
        ]}
      />
      <div className="flex-1">
        {content}
        {showCreateForm && (
          <WorkspaceEdit
            workspace={DEFAULT_WORKSPACE}
            onConfirm={() => setShowCreateForm(false)}
            onCancel={() => setShowCreateForm(false)}
          />
        )}
      </div>
    </div>
  );
}
WorkspacesView.componentId = "workspaces";
