import type { LlmModelRead } from "./provider";

export type AgentBase = {
  name: string;
  system_prompt: string;
};

export type AgentRead = AgentBase & {
  id: number;
  model: LlmModelRead | null;
};

export type AgentCreate = AgentBase & {
  model_id: number | null;
};

export type AgentUpdate = Partial<AgentCreate>;
