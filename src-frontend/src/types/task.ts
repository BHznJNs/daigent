import type { Message } from "./message";

export type TaskType = "agent" | "orchestration";

export type TaskBase = {
  title: string;
  type: TaskType;
  messages: Message[];
};

export type TaskRead = TaskBase & {
  id: number;
  agent_id: number | null;
  workspace_id: number;
};

export type TaskCreate = TaskBase & {
  agent_id: number;
  workspace_id: number;
};

export type TaskUpdate = Partial<TaskCreate>;
