import type { AgentCreate, AgentRead, AgentUpdate } from "@/types/agent";
import { API_BASE, fetchApi } from "./index";

export type AgentPaginatedResponse = {
  items: AgentRead[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

export async function fetchAgents(
  page = 1,
  perPage = 15
): Promise<AgentPaginatedResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  return await fetchApi<AgentPaginatedResponse>(`${API_BASE}/agents?${params}`);
}

export async function createAgent(agentData: AgentCreate): Promise<AgentRead> {
  return await fetchApi<AgentRead>(`${API_BASE}/agents/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(agentData),
  });
}

export async function updateAgent(
  agentId: number,
  agentData: AgentUpdate
): Promise<AgentRead> {
  return await fetchApi<AgentRead>(`${API_BASE}/agents/${agentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(agentData),
  });
}

export async function deleteAgent(agentId: number): Promise<void> {
  await fetch(`${API_BASE}/agents/${agentId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
}
