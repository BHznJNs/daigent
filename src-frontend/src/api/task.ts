import { fetchEventSource } from "@microsoft/fetch-event-source";
import type {
  AssistantMessageChunk,
  TaskCreate,
  TaskMessageCreate,
  TaskPaginatedResponse,
  TaskRead,
  ToolMessage,
} from "@/types/task";
import { API_BASE, fetchApi } from "./index";

export async function fetchTasks(
  workspaceId: number,
  page = 1,
  perPage = 15
): Promise<TaskPaginatedResponse> {
  const params = new URLSearchParams({
    workspace_id: workspaceId.toString(),
    page: page.toString(),
    per_page: perPage.toString(),
  });

  return await fetchApi<TaskPaginatedResponse>(`${API_BASE}/tasks?${params}`);
}

export async function fetchTaskById(taskId: number): Promise<TaskRead> {
  return await fetchApi<TaskRead>(`${API_BASE}/tasks/${taskId}`);
}

export async function createTask(taskData: TaskCreate): Promise<TaskRead> {
  return await fetchApi<TaskRead>(`${API_BASE}/tasks/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });
}

export async function pauseTask(taskId: number): Promise<void> {
  await fetch(`${API_BASE}/tasks/pause/${taskId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function deleteTask(taskId: number): Promise<void> {
  await fetch(`${API_BASE}/tasks/${taskId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

type TaskSSECallbacks = {
  onAssistantChunk?: (chunk: AssistantMessageChunk) => void;
  onTool?: (tool: ToolMessage) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
};

export function resumeTask(
  taskId: number,
  message: TaskMessageCreate | null,
  callbacks: TaskSSECallbacks
): AbortController {
  const abortController = new AbortController();

  fetchEventSource(`${API_BASE}/tasks/resume/${taskId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
    signal: abortController.signal,

    async onopen(response) {
      if (response.ok) {
        return;
      }

      let errorMessage: string;
      try {
        const body = await response.json();
        errorMessage = body?.error ?? `HTTP_${response.status}`;
      } catch {
        errorMessage = response.statusText || `HTTP_${response.status}`;
      }

      throw new Error(errorMessage);
    },

    onmessage(event) {
      try {
        const data = JSON.parse(event.data);

        switch (event.event) {
          case "assistant_chunk":
            callbacks.onAssistantChunk?.(data as AssistantMessageChunk);
            break;
          case "tool":
            callbacks.onTool?.(data as ToolMessage);
            break;
          default:
            console.warn("Unknown SSE event type:", event.event);
        }
      } catch (error) {
        console.error("Failed to parse SSE message:", error);
        callbacks.onError?.(
          error instanceof Error
            ? error
            : new Error("Failed to parse SSE message")
        );
      }
    },

    onerror(error) {
      callbacks.onError?.(
        error instanceof Error ? error : new Error("SSE connection error")
      );
      throw error;
    },

    onclose() {
      callbacks.onClose?.();
    },
  });

  return abortController;
}
