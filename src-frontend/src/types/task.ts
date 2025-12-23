import type { AssistantMessageChunk, Message, ToolMessage } from "./message";

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

// Paginated response type
export type TaskPaginatedResponse = {
  items: TaskRead[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

// SSE event types
export type TaskSSEEvent =
  | { event: "assistant_chunk"; data: AssistantMessageChunk }
  | { event: "tool"; data: ToolMessage };
