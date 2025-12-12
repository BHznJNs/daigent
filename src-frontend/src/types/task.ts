export type TaskType = "agent" | "orchestration";
export type TaskRole = "user" | "assistant" | "system" | "tool";

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

// --- --- --- --- --- ---

export type TaskMessage = {
  role: TaskRole;
  content: string;
  metadata: Record<string, string>;
};

export type TaskMessageCreate = TaskMessage;

// --- --- --- --- --- ---

export type TaskPaginatedResponse = {
  items: TaskRead[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

export type ChatCompletionAudioResponse = {
  id: string;
  data: string;
  expires_at: number;
  transcript: string;
};

export type ChatCompletionImageURL = {
  url: string;
  detail?: "auto" | "low" | "high";
};

export type AssistantMessageChunk = {
  content: string | null;
  reasoning_content: string | null;
  audio: ChatCompletionAudioResponse | null;
  images: ChatCompletionImageURL[] | null;
};

export type ToolMessage = {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result: unknown;
  role: "tool";
};

export type TaskSSEEvent =
  | { event: "assistant_chunk"; data: AssistantMessageChunk }
  | { event: "tool"; data: ToolMessage };
