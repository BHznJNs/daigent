import { useQuery } from "@tanstack/react-query";
import { BotIcon, PlusIcon, WorkflowIcon } from "lucide-react";
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
import type { TaskRead, TaskType } from "@/types/task";
import { SideBarHeader } from "../../SideBar";
import { TaskItem } from "./components/TaskItem";
import { TaskListSkeleton } from "./components/TaskListSkeleton";

export function TasksView() {
  const { addTab } = useTabsStore();

  // TODO: 实现 fetchTasks API
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => {
      // 临时返回空数据，等待 API 实现
      return {
        items: [
          {
            id: 1,
            type: "agent",
            title: "任务 1",
            workspace_id: 1,
          },
        ] as TaskRead[],
      };
    },
  });

  const handleOpenTask = (taskId: number) => {
    // TODO: 实现任务点击逻辑
    console.log("任务被点击：", taskId);
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
        type: taskType,
      },
    });
  };

  const content = (() => {
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
      <ScrollArea className="flex-1">
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
                  <Button variant="ghost" size="icon" className="size-8">
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
      <div className="flex-1">{content}</div>
    </div>
  );
}
TasksView.componentId = "tasks";
