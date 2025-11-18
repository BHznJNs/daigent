import type { WorkspaceCreate } from "@/types/workspace";

export const DEFAULT_WORKSPACE = {
  name: "",
  directory: "",
  usable_agent_ids: [],
} satisfies Partial<WorkspaceCreate>;
