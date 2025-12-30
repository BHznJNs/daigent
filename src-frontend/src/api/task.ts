import { fetchEventSource } from "@microsoft/fetch-event-source";
import type { ToolCallChunk, ToolMessage, UserMessage } from "@/types/message";
import type { TaskCreate, TaskRead } from "@/types/task";
import { API_BASE, fetchApi, type PaginatedResponse } from "./index";

export async function fetchTasks(
  workspaceId: number,
  page = 1,
  perPage = 15
): Promise<PaginatedResponse<TaskRead>> {
  const params = new URLSearchParams({
    workspace_id: workspaceId.toString(),
    page: page.toString(),
    per_page: perPage.toString(),
  });

  return await fetchApi<PaginatedResponse<TaskRead>>(
    `${API_BASE}/tasks?${params}`
  );
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

export async function deleteTask(taskId: number): Promise<void> {
  await fetch(`${API_BASE}/tasks/${taskId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// ============================================
// Agent Event Types (对应后端 AgentEvent)
// ============================================

/**
 * Message chunk event data - 消息块事件数据
 * 对应后端：MessageChunkEvent
 */
export type MessageChunkEventData =
  | {
      type: "text";
      content: string;
    }
  | {
      type: "tool_call";
      data: ToolCallChunk;
    };

/**
 * Tool executed event data - 工具执行结果事件数据
 * 对应后端：ToolExecutedEvent
 */
export type ToolExecutedEventData = {
  tool_call_id: string;
  result: string | null;
};

/**
 * Tool require user response event data - 工具需要用户响应事件数据
 * 对应后端：ToolRequireUserResponseEvent
 */
export type ToolRequireUserResponseEventData = {
  tool_name: "ask_user" | "finish_task";
};

/**
 * Tool require permission event data - 工具需要权限确认事件数据
 * 对应后端：ToolRequirePermissionEvent
 */
export type ToolRequirePermissionEventData = {
  tool_call_id: string;
};

/**
 * Error event data - 错误事件数据
 * 对应后端：ErrorEvent
 */
export type ErrorEventData = {
  message: string;
};

/**
 * SSE Event Types - 所有可能的 SSE 事件类型
 * 对应后端 agent_stream 函数中的所有事件
 */
export type AgentEventType =
  | "MESSAGE_CHUNK"              // MessageChunkEvent - 消息块（文本或工具调用）
  | "MESSAGE_START"              // MessageStartEvent - 消息开始
  | "MESSAGE_END"                // MessageEndEvent - 消息结束
  | "TASK_DONE"                  // TaskDoneEvent - 任务完成
  | "TASK_INTERRUPTED"           // TaskInterruptedEvent - 任务中断
  | "TOOL_EXECUTED"              // ToolExecutedEvent - 工具执行完成
  | "TOOL_REQUIRE_USER_RESPONSE" // ToolRequireUserResponseEvent - 工具需要用户响应
  | "TOOL_REQUIRE_PERMISSION"    // ToolRequirePermissionEvent - 工具需要权限确认
  | "ERROR";                     // ErrorEvent - 错误事件

/**
 * Task SSE Callbacks - 任务 SSE 事件回调接口
 */
export type TaskSseCallbacks = {
  // 消息相关回调
  onMessageStart?: () => void;
  onMessageEnd?: () => void;
  onMessageChunk?: (chunk: MessageChunkEventData) => void;
  
  // 工具相关回调
  onToolExecuted?: (data: ToolExecutedEventData) => void;
  onToolRequireUserResponse?: (data: ToolRequireUserResponseEventData) => void;
  onToolRequirePermission?: (data: ToolRequirePermissionEventData) => void;
  
  // 任务状态回调
  onTaskDone?: () => void;
  onTaskInterrupted?: () => void;
  
  // 错误和关闭回调
  onError?: (error: Error) => void;
  onClose?: () => void;
};

function createTaskSseStream(
  url: string,
  body: object,
  callbacks: TaskSseCallbacks
): AbortController {
  const abortController = new AbortController();

  fetchEventSource(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
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

        switch (event.event as AgentEventType) {
          case "MESSAGE_CHUNK":
            callbacks.onMessageChunk?.(data as MessageChunkEventData);
            break;
            
          case "MESSAGE_START":
            callbacks.onMessageStart?.();
            break;
            
          case "MESSAGE_END":
            callbacks.onMessageEnd?.();
            break;
            
          case "TOOL_EXECUTED":
            callbacks.onToolExecuted?.(data as ToolExecutedEventData);
            break;
            
          case "TOOL_REQUIRE_USER_RESPONSE":
            callbacks.onToolRequireUserResponse?.(data as ToolRequireUserResponseEventData);
            break;
            
          case "TOOL_REQUIRE_PERMISSION":
            callbacks.onToolRequirePermission?.(data as ToolRequirePermissionEventData);
            break;
            
          case "TASK_DONE":
            callbacks.onTaskDone?.();
            callbacks.onClose?.();
            abortController.abort();
            return;
            
          case "TASK_INTERRUPTED":
            callbacks.onTaskInterrupted?.();
            callbacks.onClose?.();
            abortController.abort();
            return;
            
          case "ERROR":
            callbacks.onError?.(new Error((data as ErrorEventData).message));
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

export function continueTask(
  taskId: number,
  message: UserMessage | null,
  callbacks: TaskSseCallbacks
): AbortController {
  return createTaskSseStream(
    `${API_BASE}/tasks/${taskId}/continue`,
    { message },
    callbacks
  );
}

export function toolAnswer(
  taskId: number,
  toolCallId: string,
  answer: string,
  callbacks: TaskSseCallbacks
): AbortController {
  return createTaskSseStream(
    `${API_BASE}/tasks/${taskId}/tool_answer`,
    { tool_call_id: toolCallId, answer },
    callbacks
  );
}
