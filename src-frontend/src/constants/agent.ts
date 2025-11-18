import type { AgentCreate } from "@/types/agent";

export const DEFAULT_AGENT = {
  name: "",
  system_prompt: "",
  model_id: null,
} satisfies Partial<AgentCreate>;
