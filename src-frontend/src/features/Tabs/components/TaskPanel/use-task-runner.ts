import { current } from "immer";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Updater } from "use-immer";
import { resumeTask } from "@/api/task";
import type { ToolCallChunk, ToolMessage, UserMessage } from "@/types/message";
import type { TaskRead } from "@/types/task";

export type TaskRunner = {
  run: (taskId: number, message: UserMessage | ToolMessage | null) => void;
  handleCustomToolAction: (
    toolMessageId: string,
    event: string,
    data: unknown
  ) => ToolMessage | null;
  cancel: () => void;
  isRunning: boolean;
};

export function useTaskRunner(
  setTaskData: Updater<TaskRead | null>
): TaskRunner {
  const [isRunning, setIsRunning] = useState(false);
  const abortController = useRef<AbortController | null>(null);
  const toolCallsBuffer = useRef(
    new Map<
      number,
      {
        id: string;
        name: string;
        arguments: string;
      }
    >()
  );

  const accumulateText = (text: string) => {
    setTaskData((draft) => {
      if (!draft) {
        return;
      }
      const lastMessage = draft.messages.at(-1);
      if (lastMessage?.role === "assistant") {
        lastMessage.content += text;
        return;
      }
      draft.messages.push({
        role: "assistant",
        content: text,
      });
    });
  };

  const accumulateToolCall = (toolCallChunk: ToolCallChunk) => {
    const existing = toolCallsBuffer.current.get(toolCallChunk.index);

    if (existing) {
      existing.arguments += toolCallChunk.arguments;
      if (toolCallChunk.id) {
        existing.id = toolCallChunk.id;
      }
      if (toolCallChunk.name) {
        existing.name = toolCallChunk.name;
      }
    } else {
      toolCallsBuffer.current.set(toolCallChunk.index, {
        id: toolCallChunk.id ?? "",
        name: toolCallChunk.name ?? "",
        arguments: toolCallChunk.arguments,
      });
    }
  };

  const run = (taskId: number, message: UserMessage | ToolMessage | null) => {
    abortController.current?.abort();
    setIsRunning(true);

    abortController.current = resumeTask(taskId, message, {
      onMessageStart: () => {
        toolCallsBuffer.current.clear();
        setTaskData((draft) => {
          if (!draft) {
            return;
          }
          draft.messages.push({
            role: "assistant",
            content: "",
          });
        });
      },
      onMessageChunk: (chunk) => {
        switch (chunk.type) {
          case "text":
            accumulateText(chunk.content);
            break;
          case "tool_call": {
            accumulateToolCall(chunk.data);
            break;
          }
          default:
            break;
        }
      },
      onMessageEnd: () => {
        setTaskData((draft) => {
          if (!draft) {
            return;
          }

          for (const toolCall of toolCallsBuffer.current.values()) {
            let parsedArguments: Record<string, unknown>;
            try {
              parsedArguments = JSON.parse(toolCall.arguments);
            } catch (error) {
              console.error("Failed to parse tool arguments:", error);
              // 即使解析失败也创建消息，但使用空对象
              draft.messages.push({
                role: "tool",
                id: toolCall.id,
                name: toolCall.name,
                arguments: {},
                result: null,
              } satisfies ToolMessage);
              return;
            }
            draft.messages.push({
              role: "tool",
              id: toolCall.id,
              name: toolCall.name,
              arguments: parsedArguments,
              result: null,
            } satisfies ToolMessage);
          }

          toolCallsBuffer.current.clear();
        });
      },
      onError: (error) => {
        toast.error("任务失败", {
          description: error.message || "任务失败，请稍后重试。",
        });
        setIsRunning(false);
      },
      onClose: () => {
        abortController.current = null;
        setIsRunning(false);
      },
    });
  };

  const handleCustomToolAction = (
    toolMessageId: string,
    _event: string,
    data: unknown
  ) => {
    let changedToolMessage: ToolMessage | null = null;
    setTaskData((draft) => {
      if (!draft) {
        return;
      }
      const toolMessage = draft.messages.find(
        (m) => m.role === "tool" && m.id === toolMessageId
      ) as ToolMessage | undefined;
      if (toolMessage === undefined) {
        console.warn(`Tool message not found: ${toolMessageId}`);
        return;
      }
      toolMessage.result = data;
      changedToolMessage = current(toolMessage);
    });
    console.log(changedToolMessage);
    return changedToolMessage;
  };

  const cancel = () => {
    abortController.current?.abort();
    abortController.current = null;
    setIsRunning(false);
  };

  // cancel when unmount
  useEffect(() => cancel, []);

  return {
    run,
    handleCustomToolAction,
    cancel,
    isRunning,
  };
}
