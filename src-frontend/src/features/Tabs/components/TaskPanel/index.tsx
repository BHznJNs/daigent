import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { useImmer } from "use-immer";
import { createTask, fetchTaskById, resumeTask } from "@/api/task";
import { useTabsStore } from "@/stores/tabs-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { UserMessage } from "@/types/message";
import type { Tab } from "@/types/tab";
import type { TaskRead } from "@/types/task";
import { PromptInput, type PromptInputMessage } from "./PromptInput";
import { TaskConversation } from "./TaskConversation";

type TaskPanelProps = {
  tabData: Tab;
};

export function TaskPanel({ tabData }: TaskPanelProps) {
  const { currentWorkspace } = useWorkspaceStore();
  const { updateTab } = useTabsStore();
  const [taskData, setTaskData] = useImmer<TaskRead | null>(null);
  const sseAbortController = useRef<AbortController | null>(null);

  const queryClient = useQueryClient();
  const { data: taskQueryData, isLoading: taskLoading } = useQuery({
    queryKey: tabData.metadata.isDraft
      ? ["tasks", "draft"]
      : ["tasks", tabData.metadata.taskId],
    enabled: !tabData.metadata.isDraft,
    queryFn: () => {
      if (tabData.metadata.isDraft) {
        return null;
      }
      return fetchTaskById(tabData.metadata.taskId);
    },
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: (taskRead) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      updateTab({
        ...tabData,
        metadata: {
          isDraft: false,
          taskType: tabData.metadata.taskType,
          taskId: taskRead.id,
        },
      });
      setTaskData(taskRead);
    },
  });

  useEffect(() => {
    if (taskQueryData) {
      setTaskData(taskQueryData);
    }
  }, [taskQueryData, setTaskData]);

  const startSseConnection = useCallback(
    (taskId: number, message: UserMessage | null) => {
      sseAbortController.current?.abort();

      const abortController = resumeTask(taskId, message, {
        onMessageStart: () => {
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
            case "content":
              setTaskData((draft) => {
                if (!draft) {
                  return;
                }
                const lastMessage = draft.messages.at(-1);
                if (lastMessage?.role === "assistant") {
                  lastMessage.content += chunk.content;
                  return;
                }
                draft.messages.push({
                  role: "assistant",
                  content: chunk.content,
                });
              });
              break;
            default:
              break;
          }
        },
        onTool: (tool) => {
          console.log("tool:", tool);
        },
        onError: (error) => {
          console.error("sse error:", error);
        },
        onClose: () => {
          console.log("sse closed");
        },
      });

      sseAbortController.current = abortController;
    },
    [setTaskData]
  );

  useEffect(
    () => () => {
      sseAbortController.current?.abort();
    },
    []
  );

  const handleSubmit = async (message: PromptInputMessage, agentId: number) => {
    if (!currentWorkspace) {
      throw new Error("No current workspace");
    }

    const userMessage: UserMessage = {
      role: "user",
      content: message.text,
    };

    if (tabData.metadata.isDraft) {
      const newTask = await createTaskMutation.mutateAsync({
        title: tabData.title,
        type: tabData.metadata.taskType,
        agent_id: agentId,
        workspace_id: currentWorkspace.id,
        messages: [userMessage],
      });

      startSseConnection(newTask.id, null);
    } else {
      setTaskData((draft) => {
        if (draft) {
          draft.messages.push(userMessage);
        }
      });

      startSseConnection(tabData.metadata.taskId, userMessage);
    }
  };

  return (
    <div className="flex h-full flex-col p-4">
      <TaskConversation
        messages={taskData?.messages ?? null}
        isLoading={taskLoading}
      />
      <PromptInput
        taskType={tabData.metadata.taskType}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
