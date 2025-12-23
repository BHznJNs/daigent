import { useQuery } from "@tanstack/react-query";
import { BotIcon, PlusIcon, WorkflowIcon } from "lucide-react";
import { fetchTasks } from "@/api/task";
import { FailedToLoad } from "@/components/FailedToLoad";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { tabIdFactory } from "@/lib/tab";
import { useTabsStore } from "@/stores/tabs-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { TaskType } from "@/types/task";
import { SideBarHeader } from "../../SideBar";
import { TaskItem } from "./components/TaskItem";
import { TaskListSkeleton } from "./components/TaskListSkeleton";

export function TasksView() {
  const { addTab, tabs, setActiveTab } = useTabsStore();
  const { currentWorkspace } = useWorkspaceStore();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["tasks", currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace) {
        throw new Error("No workspace selected");
      }
      return await fetchTasks(currentWorkspace.id);
    },
    enabled: !!currentWorkspace,
  });

  const handleOpenTask = (taskId: number) => {
    const task = data?.items.find((t) => t.id === taskId);
    if (!task) {
      return;
    }

    const existingTab = tabs.find(
      (t) =>
        t.type === "task" && !t.metadata.isDraft && t.metadata.taskId === taskId
    );

    if (existingTab) {
      setActiveTab(existingTab.id);
    } else {
      addTab({
        id: tabIdFactory(),
        title: task.title,
        type: "task",
        metadata: {
          isDraft: false,
          taskId: task.id,
          taskType: task.type,
        },
      });
    }
  };

  const handleNewTask = (taskType: TaskType) => {
    const defaultTitle =
      taskType === "agent" ? "New agent task" : "New orchestrator task";

    addTab({
      id: tabIdFactory(),
      title: defaultTitle,
      type: "task",
      metadata: {
        isDraft: true,
        taskType,
      },
    });
  };

  const content = (() => {
    if (!currentWorkspace) {
      return (
        <Empty>
          <EmptyContent>
            <EmptyTitle>未选择工作区</EmptyTitle>
            <EmptyDescription>请先选择一个工作区以查看任务。</EmptyDescription>
          </EmptyContent>
        </Empty>
      );
    }
    if (isLoading) {
      return <TaskListSkeleton />;
    }
    if (isError) {
      return (
        <FailedToLoad
          refetch={refetch}
          description="无法加载任务列表，请稍后重试。"
        />
      );
    }
    if (data?.items.length === 0) {
      return (
        <Empty>
          <EmptyContent>
            <EmptyTitle>暂无任务</EmptyTitle>
            <EmptyDescription>您还没有创建任何任务。</EmptyDescription>
          </EmptyContent>
        </Empty>
      );
    }
    return (
      <ScrollArea className="h-full">
        {data?.items.map((task) => (
          <TaskItem key={task.id} task={task} onClick={handleOpenTask} />
        ))}
      </ScrollArea>
    );
  })();

  return (
    <div className="flex h-full flex-col">
      <SideBarHeader
        title="Tasks"
        actions={[
          {
            button: (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    disabled={!currentWorkspace}
                  >
                    <PlusIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleNewTask("agent")}>
                    <BotIcon className="mr-2 size-4" />
                    Agent 模式
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleNewTask("orchestration")}
                  >
                    <WorkflowIcon className="mr-2 size-4" />
                    Orchestrator 模式
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
            tooltip: "Create new task",
          },
        ]}
      />
      <div className="h-full min-h-0 flex-1">{content}</div>
    </div>
  );
}
TasksView.componentId = "tasks";
