import { useSuspenseQuery } from "@tanstack/react-query";
import { fetchTasks } from "@/api/task";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { tabIdFactory } from "@/lib/tab";
import { useTabsStore } from "@/stores/tabs-store";
import type { TaskRead } from "@/types/task";
import { TaskIcon } from "./TaskIcon";

type TaskItemProps = {
  task: TaskRead;
  onClick: (taskId: number) => void;
};

export function TaskItem({ task, onClick }: TaskItemProps) {
  const handleClick = () => {
    onClick(task.id);
  };

  return (
    <Item
      variant="outline"
      size="sm"
      className="flex cursor-pointer flex-nowrap rounded-none border-t-0 border-r-0 border-l-0 hover:bg-accent/30"
      onClick={handleClick}
    >
      <ItemMedia variant="icon">
        <TaskIcon taskType={task.type} className="size-4" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{task.title}</ItemTitle>
      </ItemContent>
    </Item>
  );
}

type TaskListProps = {
  workspaceId: number;
};

export function TaskList({ workspaceId }: TaskListProps) {
  const { addTab, tabs, setActiveTab } = useTabsStore();

  const { data } = useSuspenseQuery({
    queryKey: ["tasks", workspaceId],
    queryFn: async () => await fetchTasks(workspaceId),
  });

  const handleOpenTask = (taskId: number) => {
    const task = data.items.find((t) => t.id === taskId);
    if (!task) {
      return;
    }

    const existingTab = tabs.find(
      (t) =>
        t.type === "task" && !t.metadata.isDraft && t.metadata.id === taskId
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
          id: task.id,
          type: task.type,
        },
      });
    }
  };

  if (data.items.length === 0) {
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
      {data.items.map((task) => (
        <TaskItem key={task.id} task={task} onClick={handleOpenTask} />
      ))}
    </ScrollArea>
  );
}
