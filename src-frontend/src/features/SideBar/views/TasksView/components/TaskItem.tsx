import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
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
