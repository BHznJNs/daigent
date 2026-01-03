import type { IconName } from "@/features/Tabs/AgentPanel/IconSelectDialog";
import type { LlmModelRead } from "./provider";

export type AgentBase = {
  name: string;
  icon_name: IconName;
  system_prompt: string;
};

export type AgentBrief = {
  id: number;
  name: string;
  icon_name: IconName;
};

export type AgentRead = AgentBase & {
  id: number;
  model: LlmModelRead | null;
};

export type AgentCreate = AgentBase & {
  model_id: number | null;
};

export type AgentUpdate = Partial<AgentCreate>;
