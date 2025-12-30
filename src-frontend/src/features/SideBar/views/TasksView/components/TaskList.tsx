import { useSuspenseQuery } from "@tanstack/react-query";
import { fetchTasks } from "@/api/task";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { tabIdFactory } from "@/lib/tab";
import { useTabsStore } from "@/stores/tabs-store";
import { TaskItem } from "./TaskItem";

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
