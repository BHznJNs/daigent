import type {
  WorkspaceCreate,
  WorkspaceRead,
  WorkspaceUpdate,
} from "@/types/workspace";
import { API_BASE, fetchApi } from "./index";

type WorkspacePaginatedResponse = {
  items: WorkspaceRead[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

export async function fetchWorkspaces(
  page = 1,
  perPage = 10
): Promise<WorkspacePaginatedResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  return await fetchApi<WorkspacePaginatedResponse>(
    `${API_BASE}/workspaces?${params}`
  );
}

export async function createWorkspace(
  workspaceData: WorkspaceCreate
): Promise<WorkspaceRead> {
  return await fetchApi<WorkspaceRead>(`${API_BASE}/workspaces/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(workspaceData),
  });
}

export async function updateWorkspace(
  workspaceId: number,
  workspaceData: WorkspaceUpdate
): Promise<WorkspaceRead> {
  return await fetchApi<WorkspaceRead>(
    `${API_BASE}/workspaces/${workspaceId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(workspaceData),
    }
  );
}

export async function deleteWorkspace(workspaceId: number): Promise<void> {
  await fetch(`${API_BASE}/workspaces/${workspaceId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
}
