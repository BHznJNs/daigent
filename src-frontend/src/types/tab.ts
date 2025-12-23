import type { TaskType } from "./task";

export type TaskTabMetadata = { taskType: TaskType } & (
  | { isDraft: true }
  | {
      isDraft: false;
      taskId: number;
    }
);

export type Tab = {
  id: string;
  title: string;
} & {
  type: "task";
  metadata: TaskTabMetadata;
};
