import type { TaskRead, TaskType } from "./task";

export type TaskTabMetadata =
  | {
      isDraft: true;
      type: TaskType;
    }
  | ({ isDraft: false } & TaskRead);

export type Tab = {
  id: string;
  title: string;
} & {
  type: "task";
  metadata: TaskTabMetadata;
};
