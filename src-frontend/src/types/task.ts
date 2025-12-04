export type TaskType = "agent" | "orchestration";
export type TaskRole = "user" | "assistant" | "system" | "tool";

export type TaskMessage = {
  id: number;
  role: TaskRole;
  content: string;
  metadata: Record<string, string>;
};

export type TaskBase = {
  title: string;
  type: TaskType;
  messages: TaskMessage[];
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
